import React from "react";
import { WobbleCard } from "./ui/wobble-card";
import {
  IconCast,
  IconArrowsMinimize,
  IconTransform,
  IconMusic,
} from "@tabler/icons-react";
import { Scaling, Captions } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
const Tools = () => {
  const tools_meta = [
    {
      link: "/tool/compress",
      title: "Compress",
      description: "Reduces vidoe file size",
      icon: <IconArrowsMinimize width={120} height={120} />,
      color: "bg-blue-800",
    },
    {
      link: "/tool/resize",
      title: "Resize",
      description: "Resizes your videos to fit your purpose",
      icon: <Scaling width={120} height={120} />,
      color: "bg-pink-800",
    },
    {
      link: "/tool/add_subtitles",
      title: "Add Subtitles",
      description: "Adding Subtitles to your videos",
      icon: <Captions width={120} height={120} />,
      color: "bg-zinc-800",
    },
    {
      link: "/tool/convert",
      title: "Video Convertor",
      description: "Change video to mp4, mov, mkv, webm and formats",
      icon: <IconTransform width={120} height={120} />,
      color: "bg-amber-800",
    },
    {
      link: "/tool/add_music",
      title: "Add Music",
      description: "Add or change audio of video",
      icon: <IconMusic width={120} height={120} />,
      color: "bg-cyan-800",
    },
    {
      link: "/tool/hls",
      title: "HLS Streams",
      description: "Make your video hls streamable and hoist on cloud",
      icon: <IconCast width={120} height={120} />,
      color: "bg-purple-800",
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto w-full h-max p-4 ">
      {tools_meta.map((tool, index) => (
        <Link href={tool.link} key={index}>
          <WobbleCard
            containerClassName={cn(
              `col-span-1 max-h-[300px] max-w-[300px]`,
              tool.color
            )}
          >
            <div className="flex flex-col items-center justify-center gap-2">
              {tool.icon}
              <h2 className="max-w-80 text-left text-balance text-base  md:text-lg lg:text-2xl font-semibold tracking-[-0.015em] text-white">
                {tool.title}
              </h2>
              <p className="text-xs text-center text-zinc-100">
                {tool.description}
              </p>
            </div>
          </WobbleCard>
        </Link>
      ))}
    </div>
  );
};

export default Tools;
{
  /*
  <Link href={"/tool/compress"}></Link>
      <WobbleCard containerClassName="col-span-1 max-h-[300px] max-w-[300px]">
        <div className="flex flex-col items-center justify-center gap-2">
          <IconArrowsMinimize width={120} height={120} />
          <h2 className="max-w-80 text-left text-balance text-base md:text-lg lg:text-2xl font-semibold tracking-[-0.015em] text-white">
            Compress
          </h2>
          <p className="text-xs text-center text-zinc-100">
            Reduces vidoe file size
          </p>
        </div>
      </WobbleCard>
      <Link href={"/tool/resize"}>
        <WobbleCard containerClassName="col-span-1 max-h-[300px] max-w-[300px] bg-pink-800">
          <div className="flex flex-col items-center justify-center gap-2">
            <Scaling width={120} height={120} />
            <h2 className="max-w-80 text-left text-balance text-base  md:text-lg lg:text-2xl font-semibold tracking-[-0.015em] text-white">
              Resize
            </h2>
            <p className="text-xs text-center text-zinc-100">
              Resizes your videos to fit your purpose
            </p>
          </div>
        </WobbleCard>
      </Link>
      <WobbleCard containerClassName="col-span-1 max-h-[300px] max-w-[300px] bg-zinc-800">
        <div className="flex flex-col items-center justify-center gap-2">
          <Captions width={120} height={120} />
          <h2 className="max-w-80 text-left text-balance text-base md:text-lg lg:text-2xl font-semibold tracking-[-0.015em] text-white">
            Add Subtitles
          </h2>
          <p className="text-xs text-center text-zinc-100">
            Adding Subtitles to your videos
          </p>
        </div>
      </WobbleCard>
      <WobbleCard containerClassName="col-span-1 max-h-[300px] max-w-[300px] bg-amber-800">
        <div className="flex flex-col items-center justify-center gap-2">
          <IconTransform width={120} height={120} />
          <h2 className="max-w-80 text-left text-balance text-base md:text-lg lg:text-2xl font-semibold tracking-[-0.015em] text-white">
            Video Convertor
          </h2>
          <p className="text-xs text-center text-zinc-100">
            Change video to mp4, mov, mkv, webm and formats
          </p>
        </div>
      </WobbleCard>
      <WobbleCard containerClassName="col-span-1 max-h-[300px] max-w-[300px] bg-cyan-800 ">
        <div className="flex flex-col items-center justify-center gap-2">
          <IconMusic width={120} height={120} />
          <h2 className="max-w-80 text-left text-balance text-base md:text-lg lg:text-2xl font-semibold tracking-[-0.015em] text-white">
            Add Music
          </h2>
          <p className="text-xs text-center text-zinc-100">
            Add or change audio of video
          </p>
        </div>
      </WobbleCard>
      <WobbleCard containerClassName="col-span-1 max-h-[300px] max-w-[300px] bg-purple-800">
        <div className="flex flex-col items-center justify-center gap-2 ">
          <IconCast width={120} height={120} />
          <h2 className="max-w-80 text-left text-balance text-base md:text-lg lg:text-2xl font-semibold tracking-[-0.015em] text-white">
            HLS Streams
          </h2>
          <p className="text-xs text-center text-zinc-100">
            Make your video hls streamable and hoist on cloud
          </p>
        </div>
      </WobbleCard> */
}
