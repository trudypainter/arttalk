// src/HandPose.tsx

import React, { useRef, useEffect } from "react";
import { Hands } from "@mediapipe/hands";
import * as tf from "@tensorflow/tfjs";
import { InputImage } from "@mediapipe/hands";

interface HandPoseProps {
  width: number;
  height: number;
}

const HandPose: React.FC<HandPoseProps> = ({ width, height }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    initHandPoseEstimation();
  }, []);

  const initHandPoseEstimation = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Set up the camera
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: width, height: height },
    });
    videoRef.current.srcObject = stream;
    await videoRef.current.play();

    // Set up the canvas
    const context = canvasRef.current.getContext("2d");

    // Initialize MediaPipe Hands
    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });
    hands.setOptions({
      maxNumHands: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(onResults);

    // Initialize TensorFlow.js with MediaPipe Hands
    const processVideoFrame = async () => {
      await hands.send({ image: videoRef.current as unknown as InputImage });
      requestAnimationFrame(processVideoFrame);
    };

    requestAnimationFrame(processVideoFrame);

    function onResults(results: any) {
      if (!context) return;

      if (results.multiHandLandmarks) {
        if (!canvasRef.current) return;
        context.clearRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
        results.multiHandLandmarks.forEach((landmarks: any) => {
          landmarks.forEach((point: any, index: number) => {
            const x = point.x * width;
            const y = point.y * height;

            context.fillStyle = "rgb(0,255,0)";
            context.fillRect(x, y, 5, 5);
          });
        });
      }
    }
  };

  return (
    <div>
      <video ref={videoRef} width={width} height={height} hidden />
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default HandPose;
