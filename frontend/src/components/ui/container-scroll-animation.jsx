"use client";
import React, { useRef } from "react";
import { useScroll, useTransform } from "framer-motion";

export const ContainerScroll = ({ titleComponent, children }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.9] : [1.05, 1];
  };

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      className="h-[70rem] md:h-[65rem] flex items-center justify-center relative p-2 md:p-10"
      ref={containerRef}
    >
      <div
        className="w-full relative"
        style={{
          perspective: "1300px",
        }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({ translate, titleComponent }) => {
  return (
    <div
      style={{
        translateY: translate,
      }}
      className="div max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </div>
  );
};

export const Card = ({ rotate, scale, children }) => {
  return (
    <div
      style={{
        rotateX: rotate,
        scale,
      }}
      className="max-w-5xl -mt-12 mx-auto h-[40rem] md:h-[30rem] w-full border-4 border-[#FFE8D6] p-2 md:p-6 bg-[#F9F6F7] rounded-[30px] shadow-2xl"
    >
      <div className="h-full w-full rounded-2xl bg-[#F9F6F7] md:rounded-2xl md:p-4">
        {children}
      </div>
    </div>
  );
};
