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

type VideoResolution = { width: number; height: number };

const getVideoResolution = async (
  filePath: string
): Promise<VideoResolution> => {
  try {
    const { stdout } = await execPromise(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of json "${filePath}"`
    );
    const metadata = JSON.parse(stdout);
    if (!metadata.streams?.length) {
      throw new Error("No video stream found.");
    }
    return {
      width: metadata.streams[0].width,
      height: metadata.streams[0].height,
    };
  } catch {
    throw new Error("Failed to extract video resolution.");
  }
};

type FFmpegWorkerMessage =
  | { success: true; src: string }
  | { success: false; error: string };

const runFFmpegWorker = (
  inputFilePath: string,
  meta: { width: number; height: number; dir: string }
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.resolve("worker-dist/resize_worker.js"), {
      workerData: { inputFilePath, metadata: meta },
    });

    worker.on("message", (message: FFmpegWorkerMessage) => {
      if (message.success && "src" in message) {
        resolve(message.src);
      } else {
        reject(new Error(message.error || "Unknown worker error."));
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

export async function POST(req: Request): Promise<Response> {
  const folderUUID = randomUUID();
  const date = new Date().toISOString().replace(/[:.-]/g, "");
  const uploadDir = path.join("/tmp", `${folderUUID}_${date}`, "out");
  const inputDir = path.join("/tmp", `${folderUUID}_${date}`, "in");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.mkdir(inputDir);

  let inputFilePath: string | null = null;

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new Error("File missing or invalid.");
    }

    const hfactor = parseInt(formData.get("hfactor") as string, 10);
    const wfactor = parseInt(formData.get("wfactor") as string, 10);

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      throw new Error("Invalid file type. Only video files are allowed.");
    }

    const uniqueFilename = `${path.basename(
      file.name,
      path.extname(file.name)
    )}-${randomUUID()}${path.extname(file.name)}`;
    inputFilePath = path.join(inputDir, uniqueFilename);
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(inputFilePath, Buffer.from(arrayBuffer));

    const { width, height } = await getVideoResolution(inputFilePath);

    if (Math.min(height, width) < 360) {
      throw new Error(`Video resolution too low: ${width}x${height}`);
    }

    const x = wfactor * height;
    const y = hfactor * width;

    let outwidth = width;
    let outheight = height;

    if (x > y) {
      outwidth = Math.round((outwidth * x) / y);
    } else {
      outheight = Math.round((outheight * y) / x);
    }

    const outputVideoMeta = {
      width: outwidth,
      height: outheight,
      dir: uploadDir,
    };

    const processedFilePath = await runFFmpegWorker(
      inputFilePath,
      outputVideoMeta
    );

    if (!processedFilePath) {
      throw new Error("Something went wrong in processing the video.");
    }

    const fileBuffer = await fs.readFile(processedFilePath);

    return new Response(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": 'attachment; filename="output.mp4"',
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
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
