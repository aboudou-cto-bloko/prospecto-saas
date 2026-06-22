"use client";

import { useEffect, useRef, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%";

type Props = {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
};

export function ScrambleText({ text, className, delay = 0, duration = 800 }: Props) {
  const [display, setDisplay] = useState(() => scrambled(text));
  const frameRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      const start = performance.now();
      function tick(now: number) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const revealed = Math.floor(progress * text.length);
        setDisplay(
          text.split("").map((char, i) => {
            if (char === " " || char === "\n" || char === ".") return char;
            if (i < revealed) return char;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          }).join("")
        );
        if (progress < 1) frameRef.current = requestAnimationFrame(tick);
        else setDisplay(text);
      }
      frameRef.current = requestAnimationFrame(tick);
    }, delay);
    return () => { clearTimeout(timeoutRef.current); cancelAnimationFrame(frameRef.current); };
  }, [text, delay, duration]);

  return <span className={className}>{display}</span>;
}

function scrambled(text: string) {
  return text.split("").map((c) =>
    c === " " || c === "\n" || c === "." ? c : CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join("");
}
