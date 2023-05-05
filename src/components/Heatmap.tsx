import React, { useState, useEffect, useRef } from "react";
import Sketch from "react-p5";
import p5Types from "react-p5/node_modules/@types/p5"; // Update this import statement

interface Point {
  x: number;
  y: number;
}

const Heatmap: React.FC = () => {
  const gridRef = useRef<number[][] | any>();

  const parentRef = useRef<HTMLDivElement>(null);

  const [points, setPoints] = useState<Point[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [firstDrawn, setFirstDrawn] = useState(false);

  useEffect(() => {
    const getPoints = async () => {
      const res = await fetch("/api/getAllPoints", {
        method: "GET",
      }).then((res) =>
        res.json().then((data) => {
          console.log("⭐️completed request for points", data);

          let points = data.comments.map((comment: any) => {
            return {
              x: comment.xPercentage * parentRef.current!.clientWidth,
              y: comment.yPercentage * parentRef.current!.clientHeight,
            };
          });
          setPoints(points);
          setDataLoaded(true);
        })
      );
    };
    getPoints();
  }, []);

  let gridSize = 5;
  let maxDensity = 1;
  let radius = 30;

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    if (parentRef.current) {
      const parentWidth = parentRef.current.clientWidth;
      const parentHeight = parentRef.current.clientHeight;
      p5.createCanvas(parentWidth, parentHeight).parent(canvasParentRef);
    }
    console.log("setup");
    gridRef.current = new Array(Math.floor(p5.width / gridSize))
      .fill(0)
      .map(() => new Array(Math.floor(p5.height / gridSize)).fill(0));
    maxDensity = 0;
  };

  const draw = (p5: p5Types) => {
    if (dataLoaded && !firstDrawn) {
      p5.background(255, 255, 255, 0); // Clear the background
      console.log("drawing");

      setFirstDrawn(true);

      // Calculate the radius based on the canvas dimensions
      const radius = Math.min(p5.width, p5.height) * 0.05;

      // Set the color mode to HSB (Hue, Saturation, Brightness)
      p5.colorMode(p5.HSB, 360, 100, 100, 100);

      // Render the heatmap using the points data
      for (const point of points) {
        // Calculate the color based on the distance from the center of the circle
        const hue = p5.map(radius, 0, p5.width / 2, 0, 360);

        // Draw multiple concentric circles with varying opacities to create a radial gradient
        for (let r = radius; r > 0; r -= 1) {
          const alpha = p5.map(r, 0, radius, 0, 4);
          const color = p5.color(hue, 100, 100, 1 * alpha);

          p5.fill(color);
          p5.noStroke();
          p5.ellipse(point.x, point.y, r * 2, r * 2);
        }
      }
    }
  };

  return (
    <div
      ref={parentRef}
      style={{
        position: "relative",
        width: "100%", // Set the width
        height: "100vh", // Set the height, you can adjust this value as needed
      }}
    >
      <Sketch setup={setup} draw={draw} />
    </div>
  );
};

export default Heatmap;
