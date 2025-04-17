import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import { Worker } from "worker_threads";
import { randomUUID } from "crypto";
import path from "path";
import { promisify } from "util";
import { exec } from "child_process";

const execPromise = promisify(exec);

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/mkv",
  "video/webm",
  "video/avi",
];

type Resolution = {
  width: number;
  height: number;
};

type FFmpegWorkerMetadata = {
  dir: string;
  subtitlePath: string;
};

type WorkerResponseMessage = {
  success: boolean;
  src?: string;
  error?: string;
};

const getVideoResolution = async (filePath: string): Promise<Resolution> => {
  try {
    const { stdout } = await execPromise(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of json "${filePath}"`
    );
    const metadata = JSON.parse(stdout);
    const stream = metadata?.streams?.[0];

    if (!stream?.width || !stream?.height) {
      throw new Error("No valid video stream found.");
    }

    return {
      width: stream.width,
      height: stream.height,
    };
  } catch {
    throw new Error("Failed to extract video resolution.");
  }
};

const runFFmpegWorker = (
  inputFilePath: string,
  meta: FFmpegWorkerMetadata
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const workerPath = path.resolve("worker-dist/subtitle_worker.js");

    const worker = new Worker(workerPath, {
      workerData: {
        inputFilePath,
        metadata: meta,
      },
    });

    worker.on("message", (message: WorkerResponseMessage) => {
      if (message.success && message.src) {
        resolve(message.src);
      } else {
        reject(new Error(message.error ?? "Unknown FFmpeg worker error."));
      }
    });

    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`FFmpeg worker exited with code ${code}`));
      }
    });
  });
};

const sanitizeFilename = (name: string): string => {
  return name.replace(/[^a-z0-9_\-.]/gi, "_");
};

export async function POST(req: Request): Promise<Response> {
  const folderUUID = randomUUID();
  const date = new Date().toISOString().replace(/[:.-]/g, "");
  const uploadDir = path.join("/tmp", `${folderUUID}_${date}`, "out");
  const inputDir = path.join("/tmp", `${folderUUID}_${date}`, "in");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.mkdir(inputDir);

  let inputFilePath: string | null = null;
  let subtitlePath: string | null = null;

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const subtitle = formData.get("subtitle");

    if (!(file instanceof File) || !ALLOWED_VIDEO_TYPES.includes(file.type)) {
      throw new Error("Invalid or unsupported video file type.");
    }

    const uniqueFilename = `${sanitizeFilename(
      path.basename(file.name, path.extname(file.name))
    )}-${randomUUID()}${path.extname(file.name)}`;
    inputFilePath = path.join(inputDir, uniqueFilename);
    await fs.writeFile(inputFilePath, Buffer.from(await file.arrayBuffer()));

    if (!(subtitle instanceof File)) {
      throw new Error("Subtitle file is required.");
    }

    const subtitleFilename = `sub-${sanitizeFilename(
      path.basename(subtitle.name, path.extname(subtitle.name))
    )}-${randomUUID()}${path.extname(subtitle.name)}`;
    subtitlePath = path.join(inputDir, subtitleFilename);
    await fs.writeFile(subtitlePath, Buffer.from(await subtitle.arrayBuffer()));

    const { width, height } = await getVideoResolution(inputFilePath);
    if (Math.min(width, height) < 360) {
      throw new Error(`Video resolution too low: ${width}x${height}`);
    }

    const processedFilePath = await runFFmpegWorker(inputFilePath, {
      dir: uploadDir,
      subtitlePath,
    });

    const fileBuffer = await fs.readFile(processedFilePath);

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="output.mp4"`,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await Promise.all([
      fs.rm(uploadDir, { recursive: true, force: true }).catch(console.error),
      fs.rm(inputDir, { recursive: true, force: true }).catch(console.error),
    ]);
    await fs
      .rm(path.join("/tmp", `${folderUUID}_${date}`), {
        recursive: true,
        force: true,
      })
      .catch(console.error);
  }
}
