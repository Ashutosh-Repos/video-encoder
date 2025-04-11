import ColourfulText from "@/components/ui/colourful-text";
import { ContainerTextFlip } from "@/components/ui/container-text-flip";
import Tools from "@/components/Tools";

export default function Home() {
  return (
    <div className="w-full h-full relative">
      <div className="w-full h-max mx-auto">
        <div className="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-12 mt-8">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
            Transcode Your Videos <br /> Effortlessly
          </h1>
          <p className="mb-2 text-sm sm:text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
            Fast, reliable, and powerful video transcoding in the cloud.
            <br />
            <ContainerTextFlip
              words={[
                "Convert",
                "Compress",
                "Resize",
                "Optimize",
                "Convert HLS stream",
              ]}
              className="text-sm sm:text-lg"
            />
            &nbsp;— no technical skills needed.
          </p>
          <ColourfulText text="Upload → Convert → Download" />
        </div>
        <p className="mb-8 text-xl text-white lg:text-2xl font-black px-4">
          Get started using tools
        </p>
      </div>
      <Tools />
    </div>
  );
}
