import { Feedback } from "~/constants/constant";
import React from "react";

type TopFeedbackProps = {
  feedback: Feedback;
};

export default function TopFeedback({ feedback }: TopFeedbackProps) {
  return (
    <div className="rounded-lg bg-lightgreen p-4 text-darkgreen">
      <div className="flex items-center space-x-4">
        <div className="px-2">{feedback.svg}</div>
        <div>
          <div className="text-md font-bold"> {feedback.title}</div>
          <div className="font-mono text-sm tracking-tighter">
            {" "}
            {feedback.description}
          </div>
        </div>
      </div>
    </div>
  );
}
