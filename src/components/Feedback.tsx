import {
  POINTING_FEEDBACK,
  FeedbackType,
  HOLD_FEEDBACK,
  LISTENING_FEEDBACK,
  Status,
  POINTING_SVG,
  SUBMIT_SVG,
  LISTENING_SVG,
} from "~/constants/constant";
import React from "react";
import { useState, useEffect } from "react";
import { create } from "domain";

type TopFeedbackProps = {
  feedback: FeedbackType;
  setFeedback: (feedback: FeedbackType) => void;
  createComment: (comment: string) => void;
  initIsListening: boolean;
};

export default function Feedback({
  feedback,
  setFeedback,
  createComment,
  initIsListening,
}: TopFeedbackProps) {
  const [inputValue, setInputValue] = useState("");

  const [outputs, setOutputs] = useState<string[]>([]);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [listenedBefore, setListenedBefore] = useState<boolean>(false);
  const [userHasSpoken, setUserHasSpoken] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleInputChange = (event: any) => {
    setInputValue(event.target.value);
  };

  const handleKeyDown = (event: any) => {
    if (event.keyCode === 13) {
      // Trigger your function here
      console.log("Enter key pressed");
      createComment(inputValue);
    }
  };

  useEffect(() => {
    const recognition = new (window as any).webkitSpeechRecognition();
    let silenceTimer: NodeJS.Timeout;

    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      clearTimeout(silenceTimer);
      setUserHasSpoken(true);

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          console.log("transcript", event.results[i][0].transcript);
          setOutputs((prevOutputs) => [
            ...prevOutputs,
            event.results[i][0].transcript,
          ]);

          // Check if there are two inputs in the outputs array and if the second input is "submit"
          console.log("checking outputs", outputs);
          if (
            outputs.length === 1 &&
            event.results[event.results.length - 1][0].transcript
              .trim()
              .toLowerCase() === "correct"
          ) {
            const firstOutput = outputs[0]; // Get the first output
            if (firstOutput) {
              createComment(firstOutput);
            }
          }

          // stop listening after half a second, start again after half a second
          setTimeout(() => {
            setIsListening(false);
            setTimeout(() => {
              setIsListening(true);
            }, 500);
          }, 500);
        }
      }
    };

    if (isListening || (initIsListening && !listenedBefore)) {
      console.log("starting recognition");
      setListenedBefore(true);
      recognition.start();
      recognition.onend = () => recognition.start();
    } else {
      recognition.stop();
      recognition.onend = () => {};
    }

    return () => {
      clearTimeout(silenceTimer);
      recognition.stop();
      recognition.onend = () => {};
    };
  }, [isListening, initIsListening, outputs]);

  return (
    <>
      <div className="absolute top-2 flex  w-full  justify-center ">
        <div className="flex h-full w-48 items-center justify-between rounded-b-2xl bg-dark px-8 py-4">
          <div
            className={`${
              feedback.status == Status.Pointing ? "text-light" : "text-mid"
            }`}
          >
            {POINTING_SVG}
          </div>
          <div
            className={`${
              feedback.status == Status.Talking ? "text-light" : "text-mid"
            }`}
          >
            {LISTENING_SVG}{" "}
          </div>
          {/* <div
            className={`${
              feedback.status == Status.Submitting ? "text-light" : "text-mid"
            }`}
          >
            {SUBMIT_SVG}{" "}
          </div> */}
        </div>
      </div>

      <div className="absolute bottom-2 flex w-full  justify-center ">
        <div className="  w-fit max-w-[800px] items-center justify-between rounded-t-3xl bg-dark p-8 px-8 font-mono text-sm text-light">
          {feedback.status == Status.Talking && outputs.length > 0 ? (
            <>
              {outputs.length === 1 ? (
                <div className="">
                  {" "}
                  <div className="pb-4 text-lightmid">Your output: </div>
                  <div>{outputs[0]}</div>
                  <div className="pt-4 text-lightmid">
                    Say <span className="text-light">Correct</span> to submit or{" "}
                    <span className="text-light">Try Again</span> to restart
                  </div>
                </div>
              ) : (
                "..."
              )}
            </>
          ) : (
            <>{feedback.description}</>
          )}
        </div>
      </div>
    </>
  );
}
