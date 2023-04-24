import { FeedbackType, THIRD_FEEDBACK } from "~/constants/constant";
import React from "react";
import { useState, useEffect } from "react";

type TopFeedbackProps = {
  feedback: FeedbackType;
  createComment: (comment: string) => void;
};

export default function Feedback({
  feedback,
  createComment,
}: TopFeedbackProps) {
  const [inputValue, setInputValue] = useState("");

  const [output, setOutput] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(true);
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
          setOutput(
            (prevOutput) => prevOutput + event.results[i][0].transcript
          );
        }
      }

      silenceTimer = setTimeout(() => {
        setIsListening(false);
      }, 2000); // Set the duration of silence to 2 seconds (2000 milliseconds)
    };

    if (isListening) {
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
  }, [isListening]);

  return (
    <>
      <div className="mb-4 rounded-lg bg-lightgreen p-4 text-darkgreen">
        <div className="flex items-center space-x-4">
          <div className="w-12 px-2">{feedback.svg}</div>
          <div>
            <div className="text-md font-bold"> {feedback.title}</div>
            <div className="font-mono text-sm tracking-tighter">
              {" "}
              {feedback.description}
            </div>
          </div>
        </div>
      </div>
      {feedback.title === THIRD_FEEDBACK.title && (
        <>
          <div className="mb-4 rounded-lg bg-lightgray px-8  py-6 font-bold text-darkgray">
            What have other people said about this spot?
          </div>
          <div className="mb-4 rounded-lg bg-lightgray px-8  py-6 font-bold text-darkgray">
            I like ____ about this spot.
          </div>

          {/* <input
            className="mb-4 w-full rounded-lg bg-lightgray px-8 py-6 focus:outline-0"
            placeholder="Enter comment here"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          ></input> */}

          <div className="mb-4 rounded-lg bg-lightgray px-8  py-6  text-darkgray">
            {output.length > 1 ? (
              <>
                {output}
                <div className="flex w-full justify-end">
                  <div
                    className="mt-4 w-fit rounded-lg bg-darkgray px-4 py-2  text-lightgray hover:cursor-pointer"
                    onClick={() => {
                      createComment(output);
                      setSubmitting(true);
                    }}
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </div>
                </div>
              </>
            ) : (
              <>
                {isListening && userHasSpoken
                  ? "Listening..."
                  : "Once you start speaking, your comment will appear here."}
              </>
            )}
          </div>
          <div></div>
        </>
      )}
    </>
  );
}
