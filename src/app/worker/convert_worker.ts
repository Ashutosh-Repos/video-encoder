import { parentPort, workerData } from "worker_threads";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface Metadata {
  dir: string;
  format?: string;
}

const allowedFormats = new Set([
  "mp4",
  "mov",
  "avi",
  "mkv",
  "webm",
  "flv",
  "wmv",
  "mpeg",
  "3gp",
  "ogv",
  "m4v",
]);

/**
 * Ensures the video format is valid, defaults to mp4 if not.
 * @param format - Desired video format
 */
const getSafeFormat = (format?: string): string => {
  const safeFormat = format?.toLowerCase();
  return safeFormat && allowedFormats.has(safeFormat) ? safeFormat : "mp4";
};

/**
 * Re-encodes a video and converts its format.
 * @param inputFilePath - Path to the input video file.
 * @param metadata - Output metadata including format and directory.
 */
const runFFmpeg = async (
  inputFilePath: string,
  metadata: Metadata
): Promise<string> => {
  const format = getSafeFormat(metadata.format);
  const outputPath = `${metadata.dir}/output.${format}`;

  const ffmpegCommand = `ffmpeg -i "${inputFilePath}" -c:v libx264 -preset veryfast -crf 23 -c:a copy "${outputPath}"`;

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

    console.log("Starting FFmpeg re-encoding with metadata:", metadata);
    const outputPath = await runFFmpeg(inputFilePath, metadata);
    console.log("FFmpeg re-encoding completed successfully.");

    parentPort?.postMessage({
      success: true,
      message: "FFmpeg re-encoding completed",
      src: outputPath,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    parentPort?.postMessage({ success: false, error: errorMessage });
  }
})();
