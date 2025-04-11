"use client";
import React, { useState } from "react";
import { MiniFileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Page = () => {
  // Manage selected file
  const [file, setFile] = useState<File | null>(null);
  // Manage selected compression quality; default to "medium"
  const [videoformat, setvideoformat] = useState<string>("mp4");

  const handleFileChange = (file: File) => {
    setFile(file);
    console.log("Selected file:", file);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.warning("Please select or drop a video file");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("format", videoformat);

    try {
      const response = await fetch("/api/convert", {
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
      a.download = `output.${videoformat}`;
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
            Convert video format <br /> Effortlessly
          </h1>
          <p className="text-sm sm:text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
            Upload a video file and choose video format
          </p>
        </div>
      </div>
      <div className="w-full h-max p-8 flex items-center justify-center">
        <div className="w-max h-max grid place-items-center gap-4">
          <MiniFileUpload onChange={handleFileChange} />
          <div className="flex gap-4 items-center">
            <Select
              onValueChange={(value) => {
                setvideoformat(value);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Choose format" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Select video format</SelectLabel>
                  <SelectItem value="mp4">mp4</SelectItem>
                  <SelectItem value="mov">mov</SelectItem>
                  <SelectItem value="avi">avi</SelectItem>
                  <SelectItem value="mkv">mkv</SelectItem>
                  <SelectItem value="webm">webm</SelectItem>
                  <SelectItem value="flv">flv</SelectItem>
                  <SelectItem value="wmv">wmv</SelectItem>
                  <SelectItem value="mpeg">mpeg</SelectItem>
                  <SelectItem value="3gp">3gp</SelectItem>
                  <SelectItem value="ogv">ogv</SelectItem>
                  <SelectItem value="m4v">m4v</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
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
