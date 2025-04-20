import { parentPort, workerData } from "worker_threads";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Define the types for metadata
interface Metadata {
  dir: string;
  subtitlePath?: string;
  format?: string;
}

/**
 * Re-encodes a video and converts its format.
 * @param inputFilePath - Path to the input video file.
 * @param metadata - Output metadata including quality, subtitle path, and desired format.
 */
const runFFmpeg = async (
  inputFilePath: string,
  metadata: Metadata
): Promise<void> => {
  const format = metadata.format ? metadata.format.toLowerCase() : "mp4";
  let subtitleOption = "";

  if (metadata.subtitlePath) {
    subtitleOption = `-vf "subtitles='${metadata.subtitlePath.replace(
      /\\/g,
      "/"
    )}'"`;
  }

  const ffmpegCommand = `ffmpeg -i "${inputFilePath}" ${subtitleOption} -c:v libx264 -preset veryfast -crf 23 -c:a copy "${metadata.dir}/output.${format}"`;

  console.log("Executing FFmpeg command:");
  console.log(ffmpegCommand);
  await execAsync(ffmpegCommand);
};

// Main FFmpeg worker logic.
(async () => {
  try {
    const {
      inputFilePath,
      metadata,
    }: { inputFilePath: string; metadata: Metadata } = workerData;

    console.log("Starting FFmpeg re-encoding with metadata:", metadata);

    // Run the FFmpeg process.
    await runFFmpeg(inputFilePath, metadata);
    console.log("FFmpeg re-encoding completed successfully.");

    const format = metadata.format ? metadata.format.toLowerCase() : "mp4";

    // Notify the parent with the output file path.
    parentPort?.postMessage({
      success: true,
      message: "FFmpeg re-encoding completed",
      src: `${metadata.dir}/output.${format}`,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    parentPort?.postMessage({ success: false, error: errorMessage });
  }
})();
