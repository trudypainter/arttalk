import React, { useRef, useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";

import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import { AnnotatedPrediction } from "@tensorflow-models/handpose";

type HandDetections = AnnotatedPrediction[];
type Landmark = number[];

const HandDetectionDemo: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<handpose.HandPose | null>(null);

  const loadModel = async () => {
    // HELP LOADING MODEL WITH CORS
    const loadedModel = await handpose.load();
    setModel(loadedModel);
    console.log("Handpose model loaded.");
  };

  useEffect(() => {
    loadModel();
  }, []);

  const detectHands = async () => {
    if (webcamRef.current && model) {
      const handDetections: HandDetections = await model.estimateHands(
        webcamRef.current.getCanvas() as HTMLCanvasElement
      );
      drawHandDetections(handDetections);
    }
  };

  const drawHandDetections = (handDetections: HandDetections) => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        handDetections.forEach((hand) => {
          hand.landmarks.forEach((point: Landmark) => {
            const [x, y] = point;
            if (x && y) {
              ctx.beginPath();
              ctx.arc(x, y, 5, 0, 2 * Math.PI);
              ctx.fillStyle = "red";
              ctx.fill();
            }
          });
        });
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      detectHands();
    }, 100);
    return () => clearInterval(interval);
  }, [model]);

  return (
    <div>
      <Webcam ref={webcamRef} width="640" height="480" />
      <canvas ref={canvasRef} width="640" height="480" />
    </div>
  );
};

export default HandDetectionDemo;
