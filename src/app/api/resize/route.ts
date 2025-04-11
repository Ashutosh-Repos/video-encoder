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
  meta: { width: number; height: number; dir: string }
): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log("hello8");
    const worker = new Worker(
      path.resolve("./src/app/api/resize/ffmpegWorker.js"),
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

export async function POST(req: Request) {
  // Create unique IDs and directories for temporary storage.
  const folderUUID = randomUUID();
  const date = new Date().toISOString().replace(/[:.-]/g, "");
  const uploadDir = path.join("temp", "final", `${folderUUID}_${date}`);
  await fs.mkdir(uploadDir, { recursive: true });
  let inputFilePath: string | null = null;
  console.log("hello");

  try {
    // Read form data and validate the file input.
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const hfactor = parseInt(formData.get("hfactor") as string);
    const wfactor = parseInt(formData.get("wfactor") as string);
    console.log("hello2");

    if (!file || !ALLOWED_VIDEO_TYPES.includes(file.type)) {
      throw new Error("Invalid file type. Only video files are allowed.");
    }
    console.log("hello3");
    const uniqueFilename = `${path.basename(
      file.name,
      path.extname(file.name)
    )}-${randomUUID()}${path.extname(file.name)}`;
    inputFilePath = path.join("temp", "uploads", uniqueFilename);
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(inputFilePath, Buffer.from(arrayBuffer));
    console.log("hello4");
    // Validate video resolution.
    const { width, height } = await getVideoResolution(inputFilePath);

    if (Math.min(height, width) < 360) {
      throw new Error(`Video resolution too low: ${width}x${height}`);
    }
    console.log("hello5");
    console.log(wfactor);
    console.log(hfactor);
    // Calculate output dimensions based on the provided hfactor and wfactor.
    const x = wfactor * height;
    const y = hfactor * width;
    let outwidth = width;
    let outheight = height;
    if (x > y) {
      outwidth = (outwidth * x) / y;
    } else {
      outheight = (outheight * y) / x;
    }
    console.log("hello6");
    const outputVideoMeta = {
      width: outwidth,
      height: outheight,
      dir: uploadDir,
    };
    console.log(outputVideoMeta);

    // Run the FFmpeg worker to process the video.
    const processedFilePath = await runFFmpegWorker(
      inputFilePath,
      outputVideoMeta
    );
    if (!processedFilePath) {
      throw new Error("Something went wrong in processing the video.");
    }
    console.log("hello7");
    // Read the processed file from disk as a Buffer.
    const fileBuffer = await fs.readFile(processedFilePath);

    // Return the file as response with headers to trigger download in the client.
    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": 'attachment; filename="output.mp4"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    // Clean up temporary files and directories.
    if (inputFilePath) {
      try {
        await fs.rm(inputFilePath, { force: true });
        console.log(`Deleted input file: ${inputFilePath}`);
      } catch (err) {
        console.error("Error deleting input file:", err);
      }
    }
    try {
      await fs.rm(uploadDir, { recursive: true, force: true });
      console.log(`Cleaned up directory: ${uploadDir}`);
    } catch (err) {
      console.error("Error cleaning up upload directory:", err);
    }
  }
}
