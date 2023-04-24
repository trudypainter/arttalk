let finalResult = "";

function main() {
  const encoding = "LINEAR16";
  const sampleRateHertz = 16000;
  const languageCode = "en-US";

  const chalk = require("chalk");
  const { Writable } = require("stream");
  const recorder = require("node-record-lpcm16");

  // Imports the Google Cloud client library
  // Currently, only v1p1beta1 contains result-end-time
  const speech = require("@google-cloud/speech").v1p1beta1;

  const client = new speech.SpeechClient();

  const config = {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
  };

  const request = {
    config,
    interimResults: true,
  };

  let recognizeStream = null;
  let audioInput = [];

  function startStream() {
    // Clear current audioInput
    audioInput = [];
    recognizeStream = client
      .streamingRecognize(request)
      .on("error", (err) => {
        if (err.code === 11) {
        } else {
          console.error("API request error " + err);
        }
      })
      .on("data", speechCallback);
  }

  const speechCallback = (stream) => {
    let stdoutText = "";
    if (stream.results[0] && stream.results[0].alternatives[0]) {
      stdoutText = stream.results[0].alternatives[0].transcript;
    }

    if (stream.results[0].isFinal) {
      lastTranscriptWasFinal = true;
      recognizeStream.end();
      finalResult = stdoutText;
      process.emit("change");
    } else {
      // Make sure transcript does not exceed console character length
      lastTranscriptWasFinal = false;
    }
  };

  const audioInputStreamTransform = new Writable({
    write(chunk, encoding, next) {
      audioInput.push(chunk);

      if (recognizeStream) {
        recognizeStream.write(chunk);
      }

      next();
    },

    final() {
      if (recognizeStream) {
        recognizeStream.end();
      }
    },
  });

  let recording = recorder.record({
    sampleRateHertz: sampleRateHertz,
    threshold: 0.75,
    silence: "2.0",
    keepSilence: true,
    endOnSilence: true,
    recordProgram: "rec", // Try also "arecord" or "sox"
  });

  recording
    .stream()
    .on("end", () => console.log("hi"))
    .pipe(audioInputStreamTransform);

  startStream();
}

main();

process.on("change", () => {
  console.log(finalResult);
});
