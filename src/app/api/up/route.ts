import fs from "node:fs/promises";
import { Worker } from "worker_threads";
import { randomUUID } from "crypto";
import path from "path";
import { promisify } from "util";
import { exec } from "child_process";
import { v2 as cloudinary } from "cloudinary";
import { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";

const execPromise = promisify(exec);

// Allowed video types
const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/mkv",
  "video/webm",
  "video/avi",
];

interface WorkerSuccessMessage {
  success: true;
  urls: { type: number; url: string }[];
  message?: string;
}

interface WorkerErrorMessage {
  success: false;
  error: string;
}

type WorkerMessage = WorkerSuccessMessage | WorkerErrorMessage;

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDAPIKEY,
  api_secret: process.env.CLOUDSECRET,
});

const uploadToCloudinary = async (
  filePath: string,
  folder: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        resource_type: "raw",
        folder,
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      },
      (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined
      ) => {
        if (error) {
          reject(
            new Error(
              `Cloudinary upload error for ${filePath}: ${error.message}`
            )
          );
        } else if (result) {
          resolve(result.url);
        } else {
          reject(new Error(`Unknown Cloudinary upload error for ${filePath}`));
        }
      }
    );
  });
};

const generateMasterPlaylist = (
  uploadSubDir: { dir: string; height: number; width: number }[]
): string => {
  return [
    "#EXTM3U",
    ...uploadSubDir.map(
      (elem, i) =>
        `#EXT-X-STREAM-INF:BANDWIDTH=${(i + 1) * 250000},RESOLUTION=${
          elem.width
        }x${elem.height}\n${elem.height}p/index.m3u8`
    ),
  ].join("\n");
};

const getVideoResolution = async (
  filePath: string
): Promise<{ width: number; height: number }> => {
  try {
    const { stdout } = await execPromise(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of json "${filePath}"`
    );

    const metadata = JSON.parse(stdout);
    return {
      width: metadata.streams[0].width,
      height: metadata.streams[0].height,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error:Failed to extract video resolution";
    throw new Error(errorMessage);
  }
};

const runFFmpegWorker = (
  inputFilePath: string,
  uploadSubDir: { dir: string; height: number; width: number }[]
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.resolve("worker-dist/hls_worker.js"), {
      workerData: { inputFilePath, uploadSubDir },
    });

    worker.on("message", (message: { success: boolean; error?: string }) => {
      if (message.success) {
        resolve();
      } else {
        reject(new Error(message.error || "FFmpeg worker error"));
      }
    });

    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0)
        reject(new Error(`FFmpeg worker exited with code ${code}`));
    });
  });
};

const runUploadWorker = (
  uploadSubDir: { dir: string; height: number; width: number }[],
  folderUUID: string
): Promise<WorkerSuccessMessage["urls"]> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      path.resolve("worker-dist/hls_upload_worker.js"),
      {
        workerData: { uploadSubDir, folderUUID },
      }
    );

    worker.on("message", (message: WorkerMessage) => {
      if (message.success) {
        resolve(message.urls);
      } else if (message.error) {
        reject(new Error(message.error));
      }
    });

    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0)
        reject(new Error(`Upload worker exited with code ${code}`));
    });
  });
};

// Main handler function
export async function POST(req: Request): Promise<Response> {
  const stream = new ReadableStream({
    async start(controller) {
      // Helper function to format SSE messages
      const sendStatus = (id: number, message: string, data: object = {}) => {
        controller.enqueue(
          `id: ${id}\n` +
            `event: status\n` +
            `data: ${JSON.stringify({ message, ...data })}\n\n`
        );
      };

      const folderUUID = randomUUID();
      const date = new Date().toISOString().replace(/[:.-]/g, "");
      const uploadDir = path.join("temp/final", `${folderUUID}_${date}`);
      const evtid = { id: 1 }; // Use a mutable object to track the event id

      let inputFilePath: string | null = null;

      try {
        sendStatus(evtid.id++, "Reading file...");
        const formData = await req.formData();
        const file = formData.get("file") as File;
        console.log("getting");
        // Validate file input
        if (!file || !ALLOWED_VIDEO_TYPES.includes(file.type)) {
          throw new Error("Invalid file type. Only video files are allowed.");
        }

        const uniqueFilename = `${path.basename(
          file.name,
          path.extname(file.name)
        )}-${randomUUID()}${path.extname(file.name)}`;
        inputFilePath = path.join("temp/uploads", uniqueFilename);
        const arrayBuffer = await file.arrayBuffer();
        await fs.writeFile(inputFilePath, Buffer.from(arrayBuffer));

        sendStatus(evtid.id++, "Checking resolution...");
        const { width, height } = await getVideoResolution(inputFilePath);
        if (height > width) throw new Error("Aspect ratio should be landscape");
        if (Math.min(height, width) < 360) {
          throw new Error(`Video resolution too low: ${width}x${height}`);
        }
        sendStatus(evtid.id++, "Processing the video...");

        // Ensure the upload directory exists
        console.log("reaching0");
        await fs.mkdir(uploadDir, { recursive: true });
        const uploadSubDir = [
          { dir: `${uploadDir}/360p`, height: 360, width: 640 },
        ];
        console.log("reaching1");
        if (height >= 480)
          uploadSubDir.push({
            dir: `${uploadDir}/480p`,
            height: 480,
            width: 854,
          });
        if (height >= 720)
          uploadSubDir.push({
            dir: `${uploadDir}/720p`,
            height: 720,
            width: 1280,
          });
        if (height >= 1080)
          uploadSubDir.push({
            dir: `${uploadDir}/1080p`,
            height: 1080,
            width: 1920,
          });
        if (height >= 1620)
          uploadSubDir.push({
            dir: `${uploadDir}/1620p`,
            height: 1620,
            width: 2880,
          });
        if (height >= 2430)
          uploadSubDir.push({
            dir: `${uploadDir}/2430p`,
            height: 2430,
            width: 4320,
          });
        console.log("reaching2");

        await Promise.all(
          uploadSubDir.map((d) => fs.mkdir(d.dir, { recursive: true }))
        );
        console.log("All subdirectories created");
        console.log("reaching3");

        const ffmpegPromise = runFFmpegWorker(inputFilePath, uploadSubDir);
        console.log("ffmpeg started");
        const uploadPromise = runUploadWorker(uploadSubDir, folderUUID);
        console.log("uploader started");

        await ffmpegPromise;
        console.log("ffmpeg done");
        const m3u8Url = await uploadPromise;
        console.log(m3u8Url);
        console.log("upload done");

        const masterPlaylistPath = `${uploadDir}/index.m3u8`;
        const masterPlaylistContent = generateMasterPlaylist(uploadSubDir);
        masterPlaylistContent.trim();

        console.log(masterPlaylistContent);
        await fs.writeFile(masterPlaylistPath, masterPlaylistContent);

        const masterurl = await uploadToCloudinary(
          masterPlaylistPath,
          folderUUID
        );

        const videoUrls = {
          master: `${masterurl}`,
          ...m3u8Url,
        };

        sendStatus(0, "Processing completed", { url: videoUrls });
      } catch (error: unknown) {
        console.error("Error:", (error as Error).message);
        sendStatus(-1, "Error", { error: (error as Error).message });
      } finally {
        // Clean up
        if (inputFilePath) {
          await fs.rm(inputFilePath, { force: true });
          console.log(`Deleted input file: ${inputFilePath}`);
        }
        await fs.rm(uploadDir, { recursive: true, force: true });
        console.log(`Cleaned up directory: ${uploadDir}`);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
