const { Writable } = require("stream");

class AudioFeedBack {
  finalResult = "";
  encoding = "LINEAR16";
  sampleRateHertz = 16000;
  languageCode = "en-US";

  chalk = require("chalk");
  recorder = require("node-record-lpcm16");
  speech = require("@google-cloud/speech").v1p1beta1;

  client = new this.speech.SpeechClient();

  config = {
    encoding: this.encoding,
    sampleRateHertz: this.sampleRateHertz,
    languageCode: this.languageCode,
  };

  request = {
    config: this.config,
    interimResults: true,
  };
  static recognizeStream = null;
  static audioInput = [];

  audioInputStreamTransform = new Writable({
    write(chunk, encoding, next) {
      AudioFeedBack.audioInput.push(chunk);

      if (AudioFeedBack.recognizeStream) {
        AudioFeedBack.recognizeStream.write(chunk);
      }

      next();
    },

    final() {
      if (AudioFeedBack.recognizeStream) {
        AudioFeedBack.recognizeStream.end();
      }
    },
  });

  startRecording = () => {
    let recording = this.recorder.record({
      sampleRateHertz: this.sampleRateHertz,
      threshold: 0.75,
      silence: "2.0",
      keepSilence: true,
      endOnSilence: true,
      recordProgram: "rec", // Try also "arecord" or "sox"
    });

    recording.stream().pipe(this.audioInputStreamTransform);

    this.startStream();
  };

  startStream = () => {
    // Clear current audioInput
    AudioFeedBack.audioInput = [];
    AudioFeedBack.recognizeStream = this.client
      .streamingRecognize(this.request)
      .on("error", (err) => {
        if (err.code === 11) {
        } else {
          console.error("API request error " + err);
        }
      })
      .on("data", this.speechCallback);
  };

  speechCallback = (stream) => {
    let stdoutText = "";
    if (stream.results[0] && stream.results[0].alternatives[0]) {
      stdoutText = stream.results[0].alternatives[0].transcript;
    }
    if (stream.results[0].isFinal) {
      AudioFeedBack.recognizeStream.end();
      this.finalResult = stdoutText;
      process.emit("change");
    }
  };
}

let af = new AudioFeedBack();
process.on("change", () => console.log(af.finalResult));
