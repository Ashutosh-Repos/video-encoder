"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

const WorkInProgress = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: "--",
    hours: "--",
    minutes: "--",
    seconds: "--",
  });

  useEffect(() => {
    let dest = new Date("May 12, 2025 23:59:59").getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = dest - now;

      if (diff <= 0) {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        if (nextMonth.getMonth() === 0) {
          nextMonth.setFullYear(nextMonth.getFullYear() + 1);
        }
        dest = nextMonth.getTime();
        return;
      }

      const days = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(
        2,
        "0"
      );
      const hours = String(
        Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      ).padStart(2, "0");
      const minutes = String(
        Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      ).padStart(2, "0");
      const seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(
        2,
        "0"
      );

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  return (
    <div>
      <div className="py-8 px-4 mx-auto max-w-screen-md text-center lg:py-16 lg:px-12 grid place-items-center">
        <Image
          src={"/wrench.svg"}
          alt="maintenece"
          width={98}
          height={98}
          className="invert opacity-80 mb-8"
        />
        <h1 className="mb-4 text-4xl font-bold tracking-tight leading-none text-gray-900 lg:mb-6 md:text-5xl xl:text-6xl dark:text-white">
          Under Maintenance
        </h1>
        <p className="font-light text-gray-400 text-sm dark:text-gray-200">
          This tool is in under development phase, I will make it ready to use
          soon.
        </p>
        <p className="font-light text-gray-400 text-xs dark:text-gray-200">
          <strong className="font-black text-sm text-white">{`Reason -> `}</strong>
          is because of my semester exams and other exams. I am unable to give
          my time to complete this tool.
        </p>
      </div>
      {!(
        timeLeft.days === "--" &&
        timeLeft.hours === "--" &&
        timeLeft.minutes === "--" &&
        timeLeft.seconds === "--"
      ) && (
        <>
          <h1 className="mt-4 text-center mb-2">
            Tool will be ready soon in .....
          </h1>
          <div className="flex items-start justify-center w-full gap-1 count-down-main font-light text-zinc-100 text-4xl md:text-6xl lg:text-7xl xl:text-8xl">
            <div className="timer">
              <div className="">
                <h3 className="text-center">{timeLeft.days}</h3>
              </div>
            </div>
            <h3 className="text-center">:</h3>
            <div className="timer">
              <div className="">
                <h3 className="text-center">{timeLeft.hours}</h3>
              </div>
            </div>
            <h3 className="text-center">:</h3>
            <div className="timer">
              <div className="">
                <h3 className="text-center">{timeLeft.minutes}</h3>
              </div>
            </div>
            <h3 className="text-center">:</h3>
            <div className="timer">
              <div className="">
                <h3 className="text-center">{timeLeft.seconds}</h3>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkInProgress;
