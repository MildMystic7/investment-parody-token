"use client";
import { useEffect } from "react";
import { motion as Motion, stagger, useAnimate } from "motion/react";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
}) => {
  const [scope, animate] = useAnimate();
  let wordsArray = words.split(" ");
  useEffect(() => {
    animate(
      "span",
      {
        opacity: 1,
        filter: filter ? "blur(0px)" : "none",
      },
      {
        duration: duration ? duration : 1,
        delay: stagger(0.2),
      }
    );
  }, [scope.current]);

  const renderWords = () => {
    return (
      <Motion.div ref={scope}>
        {wordsArray.map((word, idx) => {
          return (
            <Motion.span
              key={word + idx}
              className="dark:text-white text-white opacity-0 "
              style={{
                filter: filter ? "blur(10px)" : "none",
              }}
            >
              {word}{" "}
            </Motion.span>
          );
        })}
      </Motion.div>
    );
  };

  return (
    <div className={cn("font-bold", className)}>
      <div className="dark:text-white text-white leading-snug tracking-wide">
        {renderWords()}
      </div>
    </div>
  );
};
