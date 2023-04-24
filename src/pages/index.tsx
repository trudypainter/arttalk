import { type NextPage } from "next";
import React, { useState, useRef, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Feedback from "~/components/Feedback";
import { COMPLETED_FEEDBACK, FIRST_FEEDBACK } from "~/constants/constant";
import CanvasWithCircle from "~/components/CanvasWithMousePos";
import HandDetectionDemo from "~/components/HandDetectionDemo";
import HandPose from "~/components/HandPose";
import { Dimensions } from "~/constants/constant";
import CanvasWithGuesture from "~/components/CanvasWithGuesture";

const Home: NextPage = () => {
  const [feedback, setFeedback] = useState(FIRST_FEEDBACK);
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);

  const createComment = async (input: string) => {
    if (!dimensions) return;

    const comment = {
      width: dimensions.width,
      height: dimensions.height,
      x: dimensions.x,
      y: dimensions.y,
      xPercentage: dimensions.xPercentage,
      yPercentage: dimensions.yPercentage,
      body: input,
    };
    console.log(comment);

    const res = await fetch("/api/createComment", {
      method: "POST",
      body: JSON.stringify({
        comment,
      }),
    });
    const data = await res.json();
    setFeedback(COMPLETED_FEEDBACK);
  };

  return (
    <>
      <Head>
        <title>Art Talk</title>
        <meta name="description" content="Final project for 6.8510" />
        <link rel="icon" href="/fav.ico" />
      </Head>

      <main className="flex w-full  justify-center  space-x-8 pt-12">
        <div className="max-h-screen w-6/12 ">
          <div className="text-3xl font-bold">Art Talk</div>
          <div className="relative border-2 border-black">
            <div className="absolute left-0 top-0 h-full w-full ">
<<<<<<< HEAD
              <CanvasWithCircle
                setFeedback={setFeedback}
                feedback={feedback}
                setCoordDimensions={setDimensions}
=======
              <CanvasWithGuesture
                setFeedback={setFeedback}
                feedback={feedback}
>>>>>>> f5aa1cf (adds guesture)
              />
            </div>
            <img
              className=" m-auto p-8"
              style={{ height: "calc(100vh - 200px)" }}
              src="https://nrs.harvard.edu/urn-3:HUAM:76465_dynmc?width=3000&height=3000"
            ></img>
          </div>

          <div>
            <div className="text-xl">The Road in the Forest</div>
            <div className="">Hilaire-Germain-Edgar Degas, 1890</div>
          </div>
        </div>

        <div className="w-4/12 max-w-[500px] pt-11">
          <Feedback feedback={feedback} createComment={createComment} />
        </div>
      </main>
    </>
  );
};

export default Home;
