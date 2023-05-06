/* eslint-disable @typescript-eslint/no-non-null-assertion */
// CanvasWithCircle.tsx
import React, {
  useRef,
  useState,
  useEffect,
  RefObject,
  MutableRefObject,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Dimensions,
  POINTING_FEEDBACK,
  FeedbackType,
  HOLD_FEEDBACK,
  TALK_FEEDBACK,
  Point,
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
  webcamRef: RefObject<Webcam>;
  setIsListening: (isListening: boolean) => void;
  currentPosition: MutableRefObject<Point | null>;
  holdPosition: MutableRefObject<Point | null>;
  holdingStart: MutableRefObject<number | null>;
  noPositionStart: MutableRefObject<number | null>;
  pauseDrawing: MutableRefObject<boolean>;
  getCommentsAtLocation: (xPercentage: number, yPercentage: number) => void;
  ref: RefObject<any>;
}

const CanvasWithGuesture = forwardRef<any, CanvasWithGuestureProps>(
  function CanvasWithGuesture(
    {
      setFeedback,
      setCoordDimensions,
      webcamRef,
      setIsListening,
      currentPosition,
      holdPosition,
      holdingStart,
      noPositionStart,
      pauseDrawing,
      getCommentsAtLocation,
    },
    ref
  ) {
    let history = [0];
    let timestamps = [0];
    let slopes = [0];

    const resetCanvas = () => {
      window.location.reload();
      /*console.log("RESET");
      if (canvasRef.current) {
        const context = canvasRef.current.getContext("2d");
        if (context) {
          context.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.width
          );
        }
      }
      setFeedback(POINTING_FEEDBACK);
      currentPosition.current = null;
      holdPosition.current = null;
      holdingStart.current = null;
      noPositionStart.current = null;
      pauseDrawing.current = false;*/
    };

    const softResetCanvas = () => {
      if (canvasRef.current) {
        const context = canvasRef.current.getContext("2d");
        if (context) {
          context.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.width
          );
        }
      }
      setFeedback(POINTING_FEEDBACK);
      currentPosition.current = null;
      holdPosition.current = null;
      holdingStart.current = null;
      noPositionStart.current = null;
      pauseDrawing.current = false;
    };

    useImperativeHandle(ref, () => ({
      reset() {
        resetCanvas();
      },
    }));

    const canvasRef = useRef<HTMLCanvasElement>(null);
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
          requestAnimationFrame(drawMask);

          const startTimeMs = performance.now();
          const detections = handLandmarker.detectForVideo(video, startTimeMs);
          if (
            detections.landmarks[0] !== undefined &&
            detections.landmarks[0][8] !== undefined
          ) {
            if (pauseDrawing.current == false) {
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
                if (performance.now() - holdingStart.current > 1000) {
                  setIsListening(true);
                  getCommentsAtLocation(x, y);
                  drawCircle(x, y, canvas.width, canvas.height, context, true);
                  setFeedback(TALK_FEEDBACK);
                  setCoordDimensions({
                    width: canvas.width,
                    height: canvas.height,
                    x: x * canvas.width,
                    y: y * canvas.height,
                    xPercentage: x,
                    yPercentage: y,
                  });
                  pauseDrawing.current = true;
                }
              }
            } else {
              const { x, y } = detections.landmarks[0][8];
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
              //console.log("LEN", slopes);
              if (slopes.filter((slope) => slope > 0.1).length >= 2) {
                softResetCanvas();
                history.length = 0;
                timestamps.length = 0;
                slopes.length = 0;
              }
            }
          } else {
            if (pauseDrawing.current == false) {
              if (noPositionStart.current == null) {
                noPositionStart.current = performance.now();
              } else if (performance.now() - noPositionStart.current > 3000) {
                softResetCanvas();
              }
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
          holdingStart.current = null;
        }
      }
      if (holdingStart.current == null) {
        holdPosition.current = { x: runningX, y: runningY };
        holdingStart.current = performance.now();
        setFeedback(HOLD_FEEDBACK);
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
      context.fillStyle = fill ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0)"; // Transparent fill or black fill
      context.fill();
      context.strokeStyle = "black";
      if (fill) {
        context.lineWidth = 5;
        context.setLineDash([]);
      } else {
        context.lineWidth = 3;
        context.setLineDash([12, 2]); // Dotted border
      }
      context.stroke();
    };

    return (
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ display: "block" }}
      />
    );
  }
);

export default React.memo(CanvasWithGuesture);
