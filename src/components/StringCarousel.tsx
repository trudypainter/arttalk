// StringCarousel.tsx
import React, { useState, useEffect } from "react";
import { Transition } from "@headlessui/react";

interface StringCarouselProps {
  strings: any[];
  interval: number;
}

const StringCarousel: React.FC<StringCarouselProps> = ({
  strings,
  interval,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % strings.length);
    }, interval);

    return () => {
      clearInterval(timer);
    };
  }, [strings, interval]);

  return (
    <div className="relative min-h-[1.5rem] w-full pb-4 text-center">
      {strings.map((str, index) => (
        <Transition
          key={index}
          show={currentIndex === index}
          enter="transition-opacity duration-400"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-400"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <span className="absolute left-0 right-0 top-0 mx-auto">{str}</span>
        </Transition>
      ))}
    </div>
  );
};

export default StringCarousel;
