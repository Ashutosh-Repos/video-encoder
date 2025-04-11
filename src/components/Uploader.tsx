"use client";
import React, { useEffect, useState, useMemo, Suspense } from "react";
import { MiniFileUpload } from "@/components/ui/file-upload";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import HlsVideo from "hls-video-element/react";
import MediaThemeSutro from "player.style/sutro/react";
import HamsterWheel from "./HamsterWheel";
import Link from "next/link";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { Button } from "./ui/button";

interface uploadeProps {
  name: string;
  type: string;
}

const Uploader = ({ name, type }: uploadeProps) => {
  const router = useRouter();
  const [status, setStatus] = useState<any>();
  const [err, setErr] = useState<any>();
  const [isSent, setIsSent] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isBtnDisabled, setBtnDisabled] = useState<boolean>(false);
  const [waiting, setWaiting] = useState<boolean>(false);
  const [videoFileName, setVideoFileName] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    const textToCopy = videoUrl;
    if (textToCopy !== "") {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    setVideoFileName(file.name);
    setBtnDisabled(true);
    try {
      const res = await fetch("/api/up", {
        method: "POST",
        body: formData,
      });
      console.log(res);

      if (!res?.ok) {
        toast("Unable to reach transcoder server.....");
        return;
      }
      if (!res?.body) {
        toast("Response body is null or undefined.");
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      async function readSSEStream() {
        const { done, value } = await reader.read();
        if (done) {
          console.log("Stream complete");
          setBtnDisabled(false);
          return;
        }
        const text = decoder.decode(value, { stream: true });
        const sseMessages = text.split("\n\n");
        sseMessages.forEach((message) => {
          if (message) {
            setIsSent(true);
            const parsedMessage = parseSSEMessage(message);
            handleSSEData(parsedMessage);
          }
        });
        return readSSEStream();
      }
      await readSSEStream();
    } catch (error: any) {
      console.error("Upload or SSE failed:", error);
      toast(
        error?.message ||
          "video upload server error or unable to read server response"
      );
      setBtnDisabled(true);
      setIsSent(false);
    }
  };

  const parseSSEMessage = (message: string) => {
    const sseLines = message.split("\n");
    let data = "";
    let event = "";
    let id = "";

    sseLines.forEach((line) => {
      if (line.startsWith("data:")) {
        data += line.replace("data:", "").trim();
      } else if (line.startsWith("event:")) {
        event = line.replace("event:", "").trim();
      } else if (line.startsWith("id:")) {
        id = line.replace("id:", "").trim();
      }
    });

    return { data, event, id };
  };

  const handleSSEData = (parsedMessage: {
    data: string;
    event: string;
    id: string;
  }) => {
    try {
      const info = JSON.parse(parsedMessage.data);

      console.log(info);

      if (parseInt(parsedMessage.id) >= 0) {
        if (parseInt(parsedMessage.id) === 0) {
          console.log(info);
          setVideoUrl(info?.url?.master);
        }
        setStatus(info.message);
      } else {
        setErr(info?.err);
        setStatus("");
      }
    } catch (error) {
      console.error("Error parsing SSE data:", error);
      setErr("Failed to parse SSE message");
    }
  };

  const filechange = (file: File) => {
    if (file) setFile(file);
    console.log("Selected file", file);
  };

  return (
    <div className="w-full h-max relative">
      <div className="w-full h-max mx-auto">
        <div className="py-4 px-4 mx-auto max-w-screen-xl text-center lg:py-8 lg:px-12 mt-8">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
            Make HLS of video <br /> Effortlessly
          </h1>
          <p className="text-sm sm:text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
            Upload a video file
          </p>
        </div>
      </div>
      <div className="w-full h-max p-8 flex items-center justify-center">
        {!isSent ? (
          <div className="w-max h-max grid place-items-center gap-4">
            <MiniFileUpload onChange={filechange} />
            <div className="flex gap-4 items-center">
              <Button
                className="font-bold cursor-pointer"
                onClick={handleUpload}
              >
                Upload
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[60rem] sm:w-96 md:w-[38rem] lg:w-[52rem] xl:w-[60rem] gap-4 flex flex-col h-max p-4 bg-neutral-950 rounded-2xl relative items-center justify-center">
            <div className="aspect-video w-full border-2  relative flex items-center justify-center">
              {videoUrl && (
                <MediaThemeSutro>
                  <HlsVideo
                    slot="media"
                    src={videoUrl}
                    playsInline
                    suppressHydrationWarning
                    className="w-full"
                    muted
                  ></HlsVideo>
                </MediaThemeSutro>
              )}
            </div>

            {videoUrl ? (
              <div className="w-full h-max px-2 flex flex-col overflow-x-scroll mb-2">
                <div className="relative w-full h-8 flex items-center justify-between">
                  <p className="text-xs text-zinc-400 font-medium ">
                    Video Link
                  </p>
                  <button
                    onClick={copyToClipboard}
                    className="h-max w-max flex items-center justify-center"
                  >
                    {copied ? (
                      <IconCheck
                        className="absolute right-0 z-[1] cursor-pointer"
                        size={16}
                      />
                    ) : (
                      <IconCopy
                        size={16}
                        className="absolute right-0 z-[1] cursor-pointer"
                      />
                    )}
                  </button>
                </div>
                <div className="relative flex mb-4 w-full overflow-x-scroll h-max ">
                  <Link
                    className="text-[10px] w-full px-2 text-sky-400"
                    href={videoUrl}
                  >
                    {videoUrl}
                  </Link>
                </div>
                <p className="text-xs text-zinc-400 font-medium">File name</p>
                <p className="text-xs text-zinc-400 font-medium">
                  {videoFileName}
                </p>
              </div>
            ) : (
              <div className="w-20 aspect-square">
                <HamsterWheel />
              </div>
            )}

            <p className="text-xs">{status}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Uploader;
