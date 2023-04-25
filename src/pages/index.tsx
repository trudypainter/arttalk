import { type NextPage } from "next";
import React, { useState, useRef } from "react";
import Head from "next/head";
import Feedback from "~/components/Feedback";
import {
  COMPLETED_FEEDBACK,
  POINTING_FEEDBACK,
  Point,
} from "~/constants/constant";
import { Dimensions } from "~/constants/constant";
import CanvasWithGuesture from "~/components/CanvasWithGuesture";
import Webcam from "react-webcam";

const Home: NextPage = () => {
  const [feedback, setFeedback] = useState(POINTING_FEEDBACK);
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const currentPosition = useRef<Point | null>(null);
  const holdPosition = useRef<Point | null>(null);
  const holdingStart = useRef<number | null>(null);
  const noPositionStart = useRef<number | null>(null);
  const pauseDrawing = useRef(false);

  const createComment = async (input: string) => {
    console.log("got here", dimensions);
    pauseDrawing.current = false;
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
    console.log("completed request", data);
    setFeedback(COMPLETED_FEEDBACK);
  };

  return (
    <>
      <Head>
        <title>Art Talk</title>
        <meta name="description" content="Final project for 6.8510" />
        <link rel="icon" href="/fav.ico" />
      </Head>

      <main className="flex h-screen w-full  justify-center space-x-8  bg-dark ">
        <div className="relative ">
          <div className="absolute left-0 top-0 h-full w-full ">
            <CanvasWithGuesture
              setFeedback={setFeedback}
              setCoordDimensions={setDimensions}
              webcamRef={webcamRef}
              setIsListening={setIsListening}
              currentPosition={currentPosition}
              holdPosition={holdPosition}
              holdingStart={holdingStart}
              noPositionStart={noPositionStart}
              pauseDrawing={pauseDrawing}
            />
          </div>
          <img
            className=" m-auto h-full w-full object-contain p-8"
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884.jpg/1200px-A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884.jpg"
          ></img>
        </div>

        <Feedback
          feedback={feedback}
          setFeedback={setFeedback}
          createComment={createComment}
          initIsListening={isListening}
        />

        <Webcam
          ref={webcamRef}
          style={{ visibility: "hidden", position: "absolute" }}
        />
      </main>
    </>
  );
};

export default Home;
