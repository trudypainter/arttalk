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
      const shakeLandmarks: Array<NormalizedLandmark> = [];

      function drawMask() {
        const video = webcamRef.current?.video as HTMLVideoElement;
        if (video && video.videoHeight > 0 && video.videoWidth > 0) {
          requestAnimationFrame(drawMask);

          const startTimeMs = Date.now();
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
                if (Date.now() - holdingStart.current > 1000) {
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
              /*if (
                detectShake(
                  shakeLandmarks,
                  detections.landmarks[0][8],
                  100,
                  0.2,
                  0.3,
                  3
                )
              ) {
                resetCanvas();
                shakeLandmarks.length = 0;
              }*/
            }
          } else {
            if (pauseDrawing.current == false) {
              if (noPositionStart.current == null) {
                noPositionStart.current = Date.now();
              } else if (Date.now() - noPositionStart.current > 3000) {
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
        holdingStart.current = Date.now();
        setFeedback(HOLD_FEEDBACK);
      }

      const x = 1 - runningX;
      const y = runningY;
      return { x, y };
    };

    const detectShake = (
      shakeLandmarks: Array<NormalizedLandmark>,
      newLandmarkPosition: NormalizedLandmark,
      window: number,
      threshold: number,
      range: number,
      count: number
    ): boolean => {
      shakeLandmarks.push(newLandmarkPosition);
      if (shakeLandmarks.length > window) {
        shakeLandmarks.shift();
      }

      const x = shakeLandmarks.map((point) => point.x);

      const minX = Math.min(...x);
      const maxX = Math.max(...x);

      if (maxX - minX < range) {
        return false;
      }

      const numNearMin = x.filter(
        (val) => minX * (1 - threshold) < val && val < minX * (1 + threshold)
      ).length;
      const numNearMax = x.filter(
        (val) => maxX * (1 - threshold) < val && val < maxX * (1 + threshold)
      ).length;
      return numNearMin >= count && numNearMax >= count;
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
