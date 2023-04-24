import { type NextPage } from "next";
import React, { useRef, useEffect, useState } from "react";
import Head from "next/head";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import Webcam from "react-webcam";

const Test: NextPage = () => {
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    void handleStartTracking();
  });

  const handleStartTracking = async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    const handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "models/hand_landmarker.task",
      },
      numHands: 1,
      runningMode: "VIDEO",
    });
    if (handLandmarker) {
      void drawHandLandmarks(handLandmarker);
    }
  };

  const drawHandLandmarks = (handLandmarker: HandLandmarker) => {
    const startTime = Date.now();
    function drawMask() {
      const video = webcamRef.current?.video as HTMLVideoElement;
      if (video) {
        const id = requestAnimationFrame(drawMask);
        /*setAnimationFrameId(id);*/
        const startTimeMs = performance.now();
        const detections = handLandmarker.detectForVideo(video, startTimeMs);
        if (
          detections.landmarks[0] !== undefined &&
          detections.landmarks[0][8] !== undefined
        ) {
          const point_position = detections.landmarks[0][8];
          console.log(point_position.x, point_position.y);
        }
      }
    }
    drawMask();
  };

  return (
    <>
      <Head>
        <title>Art Talk</title>
        <meta name="description" content="Final project for 6.8510" />
        <link rel="icon" href="/fav.ico" />
      </Head>

      <Webcam ref={webcamRef} style={{ visibility: "hidden" }} />
    </>
  );
};

export default Test;
