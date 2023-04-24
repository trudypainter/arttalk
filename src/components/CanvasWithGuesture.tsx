// CanvasWithCircle.tsx
import React, { useRef, useState, useEffect } from "react";
import {
  Dimensions,
  FIRST_FEEDBACK,
  FeedbackType,
  SECOND_FEEDBACK,
  THIRD_FEEDBACK,
} from "~/constants/constant";
import {
  HandLandmarker,
  FilesetResolver,
  NormalizedLandmark,
} from "@mediapipe/tasks-vision";
import Webcam from "react-webcam";

interface CanvasWithGuestureProps {
  setFeedback: (feedback: FeedbackType) => void;
  setCoordDimensions: (dimensions: Dimensions) => void;
  searching: boolean;
}

interface Point {
  x: number;
  y: number;
}

const CanvasWithGuesture: React.FC<CanvasWithGuestureProps> = ({
  setFeedback,
  setCoordDimensions,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentPosition = useRef<Point | null>(null);
  const holdPosition = useRef<Point | null>(null);
  const holding = useRef<boolean>(false);
  const holdingStart = useRef<number | null>(null);
  const noPositionStart = useRef<number | null>(null);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const { width, height } =
          canvasRef.current.parentElement.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });

    updateCanvasSize();
    if (canvasRef.current && canvasRef.current.parentElement) {
      resizeObserver.observe(canvasRef.current.parentElement);
    }

    return () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        resizeObserver.unobserve(canvasRef.current.parentElement);
      }
    };
  }, []);

  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    console.log("Rendered");
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
    if (handLandmarker && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        await handleLoadWaiting();
        void drawHandLandmarks(handLandmarker, context, canvasRef.current);
      }
    }
  };

  const drawHandLandmarks = (
    handLandmarker: HandLandmarker,
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) => {
    const prevLandmarks: Array<NormalizedLandmark> = [];

    function drawMask() {
      const video = webcamRef.current?.video as HTMLVideoElement;
      if (video && video.videoHeight > 0 && video.videoWidth > 0) {
        const id = requestAnimationFrame(drawMask);
        const startTimeMs = Date.now();
        const detections = handLandmarker.detectForVideo(video, startTimeMs);
        if (
          detections.landmarks[0] !== undefined &&
          detections.landmarks[0][8] !== undefined
        ) {
          noPositionStart.current = null;
          const { x, y } = updateRunningAverage(
            prevLandmarks,
            detections.landmarks[0][8],
            3,
            0.05
          );
          drawCircle(x, y, canvas.width, canvas.height, context, false);
          currentPosition.current = { x, y };
          if (holdingStart.current) {
            if (Date.now() - holdingStart.current > 1000) {
              drawCircle(x, y, canvas.width, canvas.height, context, true);
              setFeedback(THIRD_FEEDBACK);
              setCoordDimensions({
                width: canvas.width,
                height: canvas.height,
                x: x * canvas.width,
                y: y * canvas.height,
                xPercentage: x,
                yPercentage: y,
              });
              cancelAnimationFrame(id);
            }
          }
        } else {
          if (noPositionStart.current == null) {
            noPositionStart.current = Date.now();
          } else if (Date.now() - noPositionStart.current > 3000) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            setFeedback(FIRST_FEEDBACK);
          }
        }
      }
    }
    drawMask();
  };

  const updateRunningAverage = (
    prevLandmarks: Array<NormalizedLandmark>,
    newLandmarkPosition: NormalizedLandmark,
    window: number,
    threshold: number
  ): Point => {
    prevLandmarks.push(newLandmarkPosition);
    if (prevLandmarks.length > window) {
      prevLandmarks.shift();
    }
    const runningX =
      prevLandmarks.map((point) => point.x).reduce((a, b) => a + b) /
      prevLandmarks.length;
    const runningY =
      prevLandmarks.map((point) => point.y).reduce((a, b) => a + b) /
      prevLandmarks.length;

    if (holdPosition.current) {
      const xDiff = Math.abs(
        (holdPosition.current.x - runningX) / holdPosition.current.x
      );
      const yDiff = Math.abs(
        (holdPosition.current.y - runningY) / holdPosition.current.y
      );
      if (xDiff > threshold || yDiff > threshold) {
        holdPosition.current = null;
        holding.current = false;
        holdingStart.current = null;
      }
    }
    if (holding.current == false) {
      holdPosition.current = { x: runningX, y: runningY };
      holding.current = true;
      holdingStart.current = Date.now();
      setFeedback(SECOND_FEEDBACK);
    }

    const x = 1 - runningX;
    const y = runningY;
    return { x, y };
  };

  const drawCircle = (
    x_rel: number,
    y_rel: number,
    width: number,
    height: number,
    context: CanvasRenderingContext2D,
    fill: boolean
  ) => {
    context.clearRect(0, 0, width, height);
    context.beginPath();
    context.arc(x_rel * width, y_rel * height, 50, 0, 2 * Math.PI);
    context.fillStyle = fill ? "black" : "rgba(0, 0, 0, 0)"; // Transparent fill or black fill
    context.fill();
    if (!fill) {
      context.strokeStyle = "black";
      context.lineWidth = 3;
      context.setLineDash([12, 2]); // Dotted border
      context.stroke();
    }
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ display: "block" }}
      />
      <Webcam ref={webcamRef} style={{ visibility: "hidden" }} />
    </div>
  );
};

export default React.memo(CanvasWithGuesture);
