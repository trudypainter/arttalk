// CanvasWithCircle.tsx
import React, { useRef, useState, useEffect } from "react";

const CanvasWithCircle: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [circlePosition, setCirclePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  const drawCircle = (x: number, y: number) => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, dimensions.width, dimensions.height);
        ctx.beginPath();
        ctx.arc(x, y, 50, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(0, 0, 0, 0)"; // Transparent fill
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.setLineDash([2, 4]); // Dotted border
        ctx.stroke();
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setCirclePosition({ x, y });
      drawCircle(x, y);
    }
  };

  const handleMouseLeave = () => {
    setCirclePosition(null);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      }
    }
  };

  useEffect(() => {
    if (circlePosition) {
      drawCircle(circlePosition.x, circlePosition.y);
    }
  }, [circlePosition]);

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
      onMouseLeave={handleMouseLeave}
      style={{ display: "block" }}
    />
  );
};

export default CanvasWithCircle;
