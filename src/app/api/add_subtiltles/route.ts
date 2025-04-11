import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import { Worker } from "worker_threads";
import { randomUUID } from "crypto";
import path from "path";
import { promisify } from "util";
import { exec } from "child_process";

const execPromise = promisify(exec);

// Allowed video types
const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/mkv",
  "video/webm",
  "video/avi",
];

// Get video resolution using ffprobe.
// Returns a promise that resolves to an object with numeric width and height.
const getVideoResolution = async (
  filePath: string
): Promise<{ width: number; height: number }> => {
  try {
    const { stdout } = await execPromise(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of json "${filePath}"`
    );
    const metadata = JSON.parse(stdout);
    if (!metadata.streams || !metadata.streams.length) {
      throw new Error("No video stream found.");
    }
    return {
      width: metadata.streams[0].width,
      height: metadata.streams[0].height,
    };
  } catch (error) {
    throw new Error("Failed to extract video resolution.");
  }
};

// Improved worker function.
// Note: Here, meta.width and meta.height are numbers.
const runFFmpegWorker = (
  inputFilePath: string,
  meta: { dir: string; subtitlePath: string }
): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log("hello8");
    const worker = new Worker(
      path.resolve("./src/app/api/add_subtiltles/ffmpegWorker.js"),
      { workerData: { inputFilePath, metadata: meta } }
    );
    console.log("hello9");
    worker.on("message", (message: any) => {
      if (message.success && message.src) {
        resolve(message.src);
      } else {
        reject(new Error(message.error));
      }
    });
    console.log("hello10");
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0)
        reject(new Error(`FFmpeg worker exited with code ${code}`));
    });
  });
};

const sanitizeFilename = (name: string) => {
  return name.replace(/[^a-z0-9_\-.]/gi, "_");
};

export async function POST(req: Request) {
  const folderUUID = randomUUID();
  const date = new Date().toISOString().replace(/[:.-]/g, "");
  const uploadDir = path.join("temp", "final", `${folderUUID}_${date}`);
  await fs.mkdir(uploadDir, { recursive: true });

  let inputFilePath: string | null = null;
  let subtitlePath: string | null = null;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const subtitle = formData.get("subtitle") as File;

    if (!file || !ALLOWED_VIDEO_TYPES.includes(file.type)) {
      throw new Error("Invalid video file type.");
    }

    const uniqueFilename = `${sanitizeFilename(
      path.basename(file.name, path.extname(file.name))
    )}-${randomUUID()}${path.extname(file.name)}`;
    inputFilePath = path.join("temp", "uploads", uniqueFilename);
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(inputFilePath, Buffer.from(arrayBuffer));

    if (!subtitle)
      throw new Error("Please provide subtitle file along with video");

    const subtitleFilename = `sub-${sanitizeFilename(
      path.basename(subtitle.name, path.extname(subtitle.name))
    )}-${randomUUID()}${path.extname(subtitle.name)}`;
    subtitlePath = path.join("temp", "uploads", subtitleFilename);
    const subtitleBuffer = Buffer.from(await subtitle.arrayBuffer());
    await fs.writeFile(subtitlePath, subtitleBuffer);

    const { width, height } = await getVideoResolution(inputFilePath);
    if (Math.min(height, width) < 360) {
      throw new Error(`Video resolution too low: ${width}x${height}`);
    }

    const outputVideoMeta = {
      dir: uploadDir,
      subtitlePath,
    };

    const processedFilePath = await runFFmpegWorker(
      inputFilePath,
      outputVideoMeta
    );

    const fileBuffer = await fs.readFile(processedFilePath);

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": 'attachment; filename="output.mp4"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (inputFilePath) {
      await fs.rm(inputFilePath, { force: true }).catch(console.error);
    }
    if (subtitlePath) {
      await fs.rm(subtitlePath, { force: true }).catch(console.error);
    }
    await fs
      .rm(uploadDir, { recursive: true, force: true })
      .catch(console.error);
  }
}
