"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
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
/**
 * Re-encodes a video and converts its format.
 * @param inputFilePath - Path to the input video file.
 * @param metadata - Output metadata including format and directory.
 */
const runFFmpeg = async (inputFilePath, metadata) => {
    let format = metadata.format?.toLowerCase() || "mp4";
    if (!allowedFormats.includes(format)) {
        format = "mp4";
    }
    const ffmpegCommand = `ffmpeg -i "${inputFilePath}" -c:v libx264 -preset veryfast -crf 23 -c:a copy "${metadata.dir}/output.${format}"`;
    console.log("Executing FFmpeg command:");
    console.log(ffmpegCommand);
    await execAsync(ffmpegCommand);
};
(async () => {
    try {
        const { inputFilePath, metadata, } = worker_threads_1.workerData;
        console.log("Starting FFmpeg re-encoding with metadata:", metadata);
        await runFFmpeg(inputFilePath, metadata);
        console.log("FFmpeg re-encoding completed successfully.");
        const format = metadata.format?.toLowerCase() || "mp4";
        worker_threads_1.parentPort?.postMessage({
            success: true,
            message: "FFmpeg re-encoding completed",
            src: `${metadata.dir}/output.${format}`,
        });
    }
    catch (error) {
        worker_threads_1.parentPort?.postMessage({ success: false, error: error.message });
    }
})();
