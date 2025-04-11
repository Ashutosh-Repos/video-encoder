import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="w-screen h-screen flex items-center justify-center flex-col gap-8 relative">
      <div className="relative flex flex-col justify-center items-center">
        <div className="absolute animate-spin rounded-full h-64 w-64 border-t-4 border-b-4 border-purple-500"></div>
        <Image src={"/thinkingavatar.svg"} alt="404" width={208} height={208} />

        {/* <img src="https://www.svgrepo.com/show/509001/avatar-thinking-9.svg" className="rounded-full h-28 w-28"> */}
      </div>
      <div className="text-center flex flex-col items-center justify-center">
        <h1 className="text-4xl font-black">404 Not Found</h1>
        <p className="text-xs mt-1">Could not find requested resource</p>
        <Link href="/">
          <div className="py-2 px-4 bg-zinc-50 w-max h-max text-zinc-950 mt-2 rounded-md">
            {`<- Return Home`}
          </div>
        </Link>
      </div>
      {/* <h2>Something went wrong!</h2>
      <Link href="/">Return Home</Link> */}
    </div>
    // <div>
    //   <h2>Not Found</h2>
    //   <p>Could not find requested resource</p>
    //   <Link href="/">Return Home</Link>
    // </div>
  );
}
{
  /* <div className="relative flex justify-center items-center">
<div className="absolute animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-purple-500"></div>
<img src="https://www.svgrepo.com/show/509001/avatar-thinking-9.svg" className="rounded-full h-28 w-28">
</div>
<div className="absolute animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-purple-500"></div>
<img src="https://www.svgrepo.com/show/509001/avatar-thinking-9.svg" className="rounded-full h-28 w-28">
<div className="relative flex justify-center items-center">
<div className="absolute animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-purple-500"></div>
<img src="https://www.svgrepo.com/show/509001/avatar-thinking-9.svg" className="rounded-full h-28 w-28">
</div> */
}
