const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Load the Handpose model
async function loadModel() {
  const model = await handpose.load({
    modelUrl:
      "https://crossorigin.me/https://tfhub.dev/mediapipe/tfjs-model/handskeleton/1/default/1/model.json?tfjs-format=file",
    anchorUrl:
      "https://crossorigin.me/https://tfhub.dev/mediapipe/tfjs-model/handskeleton/1/default/1/anchors.json?tfjs-format=file",
  });
  console.log("Handpose model loaded");
  return model;
}

// Start the video stream
async function startVideoStream() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

// Draw keypoints and skeleton on the canvas
function drawHands(predictions) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const prediction of predictions) {
    // Draw keypoints
    for (const point of prediction.landmarks) {
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(point[0], point[1], 5, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw skeleton
    const skeleton = prediction.annotations;
    for (const part in skeleton) {
      const points = skeleton[part];
      ctx.strokeStyle = "green";
      ctx.lineWidth = 2;

      for (let i = 0; i < points.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(points[i][0], points[i][1]);
        ctx.lineTo(points[i + 1][0], points[i + 1][1]);
        ctx.stroke();
      }
    }
  }
}

// Detect hands and update canvas
async function detectHands(model) {
  const predictions = await model.estimateHands(video);
  drawHands(predictions);
  requestAnimationFrame(() => detectHands(model));
}

// Main function
(async function main() {
  const model = await loadModel();
  await startVideoStream();
  detectHands(model);
})();
