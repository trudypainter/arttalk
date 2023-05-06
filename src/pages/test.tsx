/* eslint-disable @typescript-eslint/no-non-null-assertion */
// CanvasWithCircle.tsx
import React, { useRef, useEffect } from "react";
import {
  HandLandmarker,
  FilesetResolver,
  NormalizedLandmark,
} from "@mediapipe/tasks-vision";
import Webcam from "react-webcam";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Test = () => {
  const webcamRef = useRef<Webcam>(null);
  const chartRef = useRef<any>(null);
  let history: number[] = [0];
  let timestamps: number[] = [0];
  let slopes = [0];
  const data = {
    labels: timestamps,
    datasets: [
      {
        data: history,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  useEffect(() => {
    void handleStartTracking();
  });

  const handleLoadWaiting = async () => {
    return new Promise((resolve) => {
      const timer = setInterval(() => {
        if (webcamRef.current?.video?.readyState == 4) {
          resolve(true);
          clearInterval(timer);
        }
      }, 500);
    });
  };

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
      await handleLoadWaiting();
      void drawHandLandmarks(handLandmarker);
    }
  };

  const drawHandLandmarks = (handLandmarker: HandLandmarker) => {
    function drawMask() {
      const video = webcamRef.current?.video as HTMLVideoElement;
      if (video && video.videoHeight > 0 && video.videoWidth > 0) {
        requestAnimationFrame(drawMask);

        console.log(history.length);
        const startTimeMs = Date.now();
        const detections = handLandmarker.detectForVideo(video, startTimeMs);
        if (
          detections.landmarks[0] !== undefined &&
          detections.landmarks[0][8] !== undefined
        ) {
          const { x, y, z } = detections.landmarks[0][8];
          const pos = (x + y) / 2;
          history.push(pos);
          timestamps.push(startTimeMs);
          const slope =
            (history[history.length - 1]! - history[history.length - 2]!) /
            ((timestamps[timestamps.length - 1]! -
              timestamps[timestamps.length - 2]!) /
              100);
          slopes.push(Math.abs(slope));
          history = history.slice(-30);
          timestamps = timestamps.slice(-30);
          slopes = slopes.slice(-30);
          //console.log(slopes.filter((slope) => slope > 0.2).length);
          updateData();
        }
      }
    }
    drawMask();
  };

  const updateData = () => {
    chartRef.current.data = {
      labels: timestamps,
      datasets: [
        {
          data: slopes,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
      ],
    };
    chartRef.current.update();
  };

  const options: {
    animation: false;
    scales: {
      y: {
        min: number;
        max: number;
      };
    };
  } = {
    animation: false,
    scales: {
      y: {
        min: -1,
        max: 1,
      },
    },
  };

  return (
    <>
      <Webcam
        ref={webcamRef}
        style={{ visibility: "hidden", position: "absolute" }}
      />
      <button onClick={updateData}>Update</button>
      <Line data={data} options={options} ref={chartRef} />
    </>
  );
};

export default Test;
