"use client";
import React, { useState } from "react";
import { MiniBiFileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Page = () => {
  // Manage selected file
  const [file, setFile] = useState<File | null>(null);
  const [srtfile, setsrtFile] = useState<File | null>(null);

  const handleFileChange = ({
    video,
    subtitle,
  }: {
    video?: File;
    subtitle?: File;
  }) => {
    if (video) setFile(video);
    if (subtitle) setsrtFile(subtitle);
    console.log("Selected file:", file);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.warning("Please select or drop a video file");
      return;
    }
    if (!srtfile) {
      toast.warning("Please select or drop a subtitle file");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("subtitle", srtfile);

    try {
      const response = await fetch("/api/add_subtiltles", {
        method: "POST",
        body: formData,
      });
      // If the response is not ok, parse and show error.
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error:", errorData.error);
        alert(`Error: ${errorData.error}`);
        return;
      }
      // On success, download the returned blob as output.mp4.
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "output.mp4";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.warning("Upload failed");
      console.error("Request failed:", err.message);
      alert("An unexpected error occurred.");
    }
  };

  return (
    <div className="w-full h-max relative">
      <div className="w-full h-max mx-auto">
        <div className="py-4 px-4 mx-auto max-w-screen-xl text-center lg:py-8 lg:px-12 mt-8">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
            Write Subtitles in video <br /> Effortlessly
          </h1>
          <p className="text-sm sm:text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
            Upload video file and subtile file
          </p>
        </div>
      </div>
      <div className="w-full h-max p-8 flex items-center justify-center">
        <div className="w-max h-max grid place-items-center gap-4">
          <MiniBiFileUpload onChange={handleFileChange} />
          <div className="flex gap-4 items-center">
            <Button className="font-bold cursor-pointer" onClick={handleUpload}>
              Upload
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
