"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
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
const getSafeFormat = (format) => {
    const safeFormat = format?.toLowerCase();
    return safeFormat && allowedFormats.has(safeFormat) ? safeFormat : "mp4";
};
/**
 * Re-encodes a video and converts its format.
 * @param inputFilePath - Path to the input video file.
 * @param metadata - Output metadata including format and directory.
 */
const runFFmpeg = async (inputFilePath, metadata) => {
    const format = getSafeFormat(metadata.format);
    const outputPath = `${metadata.dir}/output.${format}`;
    const ffmpegCommand = `ffmpeg -i "${inputFilePath}" -c:v libx264 -preset veryfast -crf 23 -c:a copy "${outputPath}"`;
    console.log("Executing FFmpeg command:");
    console.log(ffmpegCommand);
    await execAsync(ffmpegCommand);
    return outputPath;
};
(async () => {
    try {
        const { inputFilePath, metadata } = worker_threads_1.workerData;
        console.log("Starting FFmpeg re-encoding with metadata:", metadata);
        const outputPath = await runFFmpeg(inputFilePath, metadata);
        console.log("FFmpeg re-encoding completed successfully.");
        worker_threads_1.parentPort?.postMessage({
            success: true,
            message: "FFmpeg re-encoding completed",
            src: outputPath,
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        worker_threads_1.parentPort?.postMessage({ success: false, error: errorMessage });
    }
})();
