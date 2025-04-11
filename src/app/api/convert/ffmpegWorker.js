const { parentPort, workerData } = require("worker_threads");
const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

/**
 * Re-encodes a video and converts its format.
 * @param {string} inputFilePath - Path to the input video file.
 * @param {{dir: string, format: string}} metadata - Output metadata including quality and desired format.
 */
const allowedFormats = [
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
];
const runFFmpeg = async (inputFilePath, metadata) => {
  // Determine the desired output format.
  // Default to mp4 if not provided.
  const format = metadata.format ? metadata.format.toLowerCase() : "mp4";
  if (!allowedFormats.includes(format)) {
    format = "mp4"; // Default to mp4 if format is not allowed
  }

  // Build the FFmpeg command for re-encoding.
  // - Uses libx264 for video encoding.

  const ffmpegCommand = `ffmpeg -i "${inputFilePath}" -c:v libx264 -preset veryfast -crf 23 -c:a copy "${metadata.dir}/output.${format}"`;

  console.log("Executing FFmpeg command:");
  console.log(ffmpegCommand);
  await execAsync(ffmpegCommand);
};

(async () => {
  try {
    const { inputFilePath, metadata } = workerData;
    console.log("Starting FFmpeg re-encoding with metadata:", metadata);
    await runFFmpeg(inputFilePath, metadata);
    console.log("FFmpeg re-encoding completed successfully.");

    const format = metadata.format ? metadata.format.toLowerCase() : "mp4";

    parentPort.postMessage({
      success: true,
      message: "FFmpeg re-encoding completed",
      src: `${metadata.dir}/output.${format}`,
    });
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  }
})();
