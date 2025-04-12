import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

export const MiniFileUpload = ({
  onChange,
}: {
  onChange: (file: File) => void;
}) => {
  const [file, setFile] = useState<File | null>(null); // Single file state
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    if (newFiles.length > 0) {
      const newFile = newFiles[0];
      setFile(newFile); // Replace the existing file
      onChange(newFile); // Notify parent of the new file
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false, // Allow only one file
    accept: {
      "video/*": [],
    },
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.log(error);
    },
  });

  return (
    <div
      className={cn(
        `w-72 sm:w-96 max-w-4xl mx-auto h-52 border-dashed bg-transparent border border-zinc-400 rounded-lg grid place-items-center`
      )}
      {...getRootProps()}
    >
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="group/file grid place-items-center rounded-lg cursor-pointer w-full h-full  relative overflow-hidden"
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          accept="video/*"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-full mt-0 max-w-xl mx-auto h-full">
            {file ? (
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="text-xs font-mono bg-zinc-900 p-2 rounded-xl w-max h-max ">
                  <p>{file.name}</p>
                  <p>{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  <p>{file.type}</p>
                  <p>
                    modified {new Date(file.lastModified).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <motion.div
                  layoutId="file-upload"
                  variants={mainVariant}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  className={cn(
                    "relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-14 max-w-14 w-14 mx-auto rounded-md",
                    "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                  )}
                >
                  {isDragActive ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-neutral-600 flex flex-col items-center"
                    >
                      Drop it
                      <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                    </motion.p>
                  ) : (
                    <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                  )}
                </motion.div>
                <motion.div
                  variants={secondaryVariant}
                  className="absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-14  w-full max-w-14 mx-auto rounded-md"
                ></motion.div>
              </>
            )}
          </div>
          <p className="text-sm text-zinc-400 mt-8">{`select or drop video file`}</p>
        </div>
      </motion.div>
    </div>
  );
};

export const MiniBiFileUpload = ({
  onChange,
}: {
  onChange?: (files: { video?: File; subtitle?: File }) => void;
}) => {
  const [video, setVideo] = useState<File | null>(null);
  const [subtitle, setSubtitle] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSubtitleFile = (file: File) =>
    /\.(srt|vtt|ass)$/i.test(file.name) ||
    [
      "application/x-subrip",
      "text/vtt",
      "text/plain",
      "application/x-ass",
    ].includes(file.type);

  const handleFileChange = (newFiles: File[]) => {
    let updatedVideo = video;
    let updatedSubtitle = subtitle;

    newFiles.forEach((file) => {
      if (file.type.startsWith("video/")) {
        updatedVideo = file;
        setVideo(file);
      } else if (isSubtitleFile(file)) {
        updatedSubtitle = file;
        setSubtitle(file);
      }
    });

    onChange?.({
      video: updatedVideo ?? undefined,
      subtitle: updatedSubtitle ?? undefined,
    });
  };

  const handleClick = () => fileInputRef.current?.click();

  const { getRootProps, isDragActive } = useDropzone({
    multiple: true,
    accept: {
      "video/*": [],
      "application/x-subrip": [],
      "text/vtt": [],
      "application/x-ass": [],
    },
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: (error) => console.log(error),
  });

  const renderFileInfo = (file: File, label: string) => (
    <div className="text-xs font-mono bg-zinc-900 p-2 rounded-xl w-64 sm:w-80 h-max">
      <strong>{label}</strong>
      <p className="text-xs w-fit">{file.name}</p>
      <p>{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
      <p>{file.type}</p>
      <p>modified {new Date(file.lastModified).toLocaleDateString()}</p>
    </div>
  );

  return (
    <div
      className={cn(
        `w-72 sm:w-96 max-w-4xl mx-auto h-52 border-dashed bg-transparent border border-zinc-400 rounded-lg grid place-items-center`
      )}
      {...getRootProps()}
    >
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="group/file grid place-items-center rounded-lg cursor-pointer w-full h-full relative overflow-scroll"
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          accept="video/*,.srt,.vtt,.ass"
          multiple
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-full mt-0 max-w-xl mx-auto h-full flex flex-col gap-2 p-4">
            {video && renderFileInfo(video, "🎬 Video")}
            {subtitle && renderFileInfo(subtitle, "📝 Subtitle")}

            {!video && !subtitle && (
              <>
                <motion.div
                  layoutId="file-upload"
                  variants={mainVariant}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={cn(
                    "relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-14 max-w-14 w-14 mx-auto rounded-md",
                    "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                  )}
                >
                  {isDragActive ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-neutral-600 flex flex-col items-center"
                    >
                      Drop it
                      <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                    </motion.p>
                  ) : (
                    <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                  )}
                </motion.div>
                <motion.div
                  variants={secondaryVariant}
                  className="absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-14 w-full max-w-14 mx-auto rounded-md"
                ></motion.div>
              </>
            )}
          </div>
          {(!video || !subtitle) && (
            <p className="text-sm text-zinc-400 mt-6">
              {`Click or drop ${!video ? "video" : ""} ${
                video && subtitle ? "and" : ""
              } ${!subtitle ? "subtitle" : ""} files`}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};
