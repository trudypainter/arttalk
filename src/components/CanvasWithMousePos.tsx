// CanvasWithCircle.tsx
import React, { useRef, useState, useEffect } from "react";
import {
  FIRST_FEEDBACK,
  FeedbackType,
  SECOND_FEEDBACK,
  THIRD_FEEDBACK,
} from "~/constants/constant";
import { Hands } from "@mediapipe/hands";

interface CanvasWithCircleProps {
  setFeedback: (feedback: FeedbackType) => void;
  feedback: FeedbackType;
}

const CanvasWithCircle: React.FC<CanvasWithCircleProps> = ({
  setFeedback,
  feedback,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [circlePosition, setCirclePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  const [hoverEnabled, setHoverEnabled] = useState(true);
  const hoverTimeoutRef = useRef<number | null>(null);

  const drawCircle = (x: number, y: number, fillBlack = false) => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, dimensions.width, dimensions.height);
        ctx.beginPath();
        ctx.arc(x, y, 50, 0, 2 * Math.PI);
        ctx.fillStyle = fillBlack ? "black" : "rgba(0, 0, 0, 0)"; // Transparent fill or black fill
        ctx.fill();
        if (!fillBlack) {
          ctx.strokeStyle = "black";
          ctx.lineWidth = 3;
          ctx.setLineDash([12, 2]); // Dotted border
          ctx.stroke();
        }
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!hoverEnabled) return;

    if (feedback.title === FIRST_FEEDBACK.title) {
      setFeedback(SECOND_FEEDBACK);
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setCirclePosition({ x, y });
      drawCircle(x, y);

      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }

      // Use window.setTimeout instead of setTimeout
      hoverTimeoutRef.current = window.setTimeout(() => {
        if (feedback.title === SECOND_FEEDBACK.title) {
          setFeedback(THIRD_FEEDBACK);
        }
        drawCircle(x, y, true);
        setHoverEnabled(false);
      }, 3000);
    }
  };

  useEffect(() => {
    if (circlePosition && hoverEnabled) {
      drawCircle(circlePosition.x, circlePosition.y);
    }
  }, [circlePosition, hoverEnabled]);

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

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      onMouseMove={handleMouseMove}
      style={{ display: "block" }}
    />
  );
};

export default CanvasWithCircle;
