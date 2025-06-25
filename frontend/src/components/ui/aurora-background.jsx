"use client";
import React from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}) => {
  return (
    <main>
      <div
        className={twMerge(
          clsx(
            "transition-bg relative flex h-[100vh] flex-col items-center justify-center bg-zinc-900 text-slate-950 dark:bg-zinc-900",
            className
          )
        )}
        {...props}
      >
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            "--aurora":
              "repeating-linear-gradient(100deg,#FF971D_10%,#1a202c_15%,#ffffff_20%,#4a5568_25%,#FF971D_30%)",

            "--dark-gradient":
              "repeating-linear-gradient(100deg,#000_0%,#000_7%,transparent_10%,transparent_12%,#000_16%)",

            "--white-gradient":
              "repeating-linear-gradient(100deg,#fff_0%,#fff_7%,transparent_10%,transparent_12%,#fff_16%)",

            "--orange-accent": "#FF971D",
            "--dark-grey-1": "#1a202c",
            "--dark-grey-2": "#4a5568",
            "--white": "#fff",
            "--black": "#000",
            "--transparent": "transparent",
          }}
        >
          <div
            //   I'm sorry but this is what peak developer performance looks like // trigger warning
            className={twMerge(
              clsx(
                `after:animate-aurora pointer-events-none absolute -inset-[10px] [background-image:var(--dark-gradient),var(--aurora)] [background-size:300%,_200%] [background-position:50%_50%,50%_50%] opacity-10 blur-[10px] filter will-change-transform [--aurora:repeating-linear-gradient(100deg,var(--orange-accent)_10%,var(--dark-grey-1)_15%,var(--white)_20%,var(--dark-grey-2)_25%,var(--orange-accent)_30%)] [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)] [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)] after:absolute after:inset-0 after:[background-image:var(--dark-gradient),var(--aurora)] after:[background-size:200%,_100%] after:[background-attachment:fixed] after:mix-blend-difference after:content-[""]`,
                showRadialGradient &&
                  `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
              )
            )}
          ></div>
        </div>
        {children}
      </div>
    </main>
  );
};
