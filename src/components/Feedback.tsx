import { FeedbackType, THIRD_FEEDBACK } from "~/constants/constant";
import React from "react";
import { useState } from "react";

type TopFeedbackProps = {
  feedback: FeedbackType;
  createComment: (comment: string) => void;
};

export default function Feedback({
  feedback,
  createComment,
}: TopFeedbackProps) {
  const [inputValue, setInputValue] = useState("");

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

          <input
            className="mb-4 w-full rounded-lg bg-lightgray px-8 py-6 focus:outline-0"
            placeholder="Enter comment here"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          ></input>
        </>
      )}
    </>
  );
}
