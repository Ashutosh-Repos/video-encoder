"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
/**
 * Re-encodes a video and converts its format.
 * @param inputFilePath - Path to the input video file.
 * @param metadata - Output metadata including quality, subtitle path, and desired format.
 */
const runFFmpeg = async (inputFilePath, metadata) => {
    const format = metadata.format ? metadata.format.toLowerCase() : "mp4";
    let subtitleOption = "";
    if (metadata.subtitlePath) {
        subtitleOption = `-vf "subtitles='${metadata.subtitlePath.replace(/\\/g, "/")}'"`;
    }
    const ffmpegCommand = `ffmpeg -i "${inputFilePath}" ${subtitleOption} -c:v libx264 -preset veryfast -crf 23 -c:a copy "${metadata.dir}/output.${format}"`;
    console.log("Executing FFmpeg command:");
    console.log(ffmpegCommand);
    await execAsync(ffmpegCommand);
};
// Main FFmpeg worker logic.
(async () => {
    try {
        const { inputFilePath, metadata, } = worker_threads_1.workerData;
        console.log("Starting FFmpeg re-encoding with metadata:", metadata);
        // Run the FFmpeg process.
        await runFFmpeg(inputFilePath, metadata);
        console.log("FFmpeg re-encoding completed successfully.");
        const format = metadata.format ? metadata.format.toLowerCase() : "mp4";
        // Notify the parent with the output file path.
        worker_threads_1.parentPort?.postMessage({
            success: true,
            message: "FFmpeg re-encoding completed",
            src: `${metadata.dir}/output.${format}`,
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        worker_threads_1.parentPort?.postMessage({ success: false, error: errorMessage });
    }
})();
