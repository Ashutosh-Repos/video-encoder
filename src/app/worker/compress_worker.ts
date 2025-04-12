import { parentPort, workerData } from "worker_threads";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface Metadata {
  dir: string;
  quality: "low" | "medium" | "high";
}

/**
 * Runs FFmpeg to compress the video file size.
 * @param inputFilePath - Path to the input video file.
 * @param metadata - Output metadata including chosen quality.
 */
const runFFmpeg = async (
  inputFilePath: string,
  metadata: Metadata
): Promise<string> => {
  const crfMap: Record<Metadata["quality"], number> = {
    low: 23,
    medium: 28,
    high: 35,
  };

  const crf = crfMap[metadata.quality];
  const outputPath = `${metadata.dir}/output.mp4`;

  const ffmpegCommand = `ffmpeg -i "${inputFilePath}" -c:v libx264 -preset veryfast -crf ${crf} -c:a copy "${outputPath}"`;

  console.log("Executing FFmpeg command:");
  console.log(ffmpegCommand);

  await execAsync(ffmpegCommand);
  return outputPath;
};

interface WorkerData {
  inputFilePath: string;
  metadata: Metadata;
}

(async () => {
  try {
    const { inputFilePath, metadata } = workerData as WorkerData;

    console.log("Starting FFmpeg compression with metadata:", metadata);
    const outputPath = await runFFmpeg(inputFilePath, metadata);
    console.log("FFmpeg compression completed successfully.");

    parentPort?.postMessage({
      success: true,
      message: "FFmpeg compression completed",
      src: outputPath,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    parentPort?.postMessage({ success: false, error: errorMessage });
  }
})();
