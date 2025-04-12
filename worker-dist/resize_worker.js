"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
/**
 * Runs FFmpeg to adjust video aspect ratio using scaling and padding filters.
 * @param inputFilePath - Path to the input video file.
 * @param metadata - Output metadata containing width, height, and directory.
 */
const runFFmpeg = async (inputFilePath, metadata) => {
    // Build the FFmpeg command.
    const ffmpegCommand = `ffmpeg -i "${inputFilePath}" \
-vf "scale=w=iw*min(${metadata.width}/iw\\,${metadata.height}/ih):h=ih*min(${metadata.width}/iw\\,${metadata.height}/ih),pad=${metadata.width}:${metadata.height}:(${metadata.width}-iw*min(${metadata.width}/iw\\,${metadata.height}/ih))/2:(${metadata.height}-ih*min(${metadata.width}/iw\\,${metadata.height}/ih))/2" \
-c:v libx264 -preset veryfast -crf 23 \
"${metadata.dir}/output.mp4"`;
    console.log("Executing FFmpeg command:");
    console.log(ffmpegCommand);
    await execAsync(ffmpegCommand);
};
// Main FFmpeg worker logic.
(async () => {
    try {
        const { inputFilePath, metadata, } = worker_threads_1.workerData;
        console.log("Starting FFmpeg processing with metadata:", metadata);
        // Process the video.
        await runFFmpeg(inputFilePath, metadata);
        console.log("FFmpeg processing completed successfully.");
        // Notify the parent with the output file path.
        worker_threads_1.parentPort?.postMessage({
            success: true,
            message: "FFmpeg processing completed",
            src: `${metadata.dir}/output.mp4`,
        });
    }
    catch (error) {
        worker_threads_1.parentPort?.postMessage({ success: false, error: error.message });
    }
})();
