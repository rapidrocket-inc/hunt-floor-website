"use client";

import { useEffect, useState, type ElementType } from "react";

type Props = {
  text: string;
  className?: string;
  /** animate per word (default) or per character */
  per?: "word" | "char";
  /** seconds before the first unit animates */
  baseDelay?: number;
  /** seconds between each unit */
  stagger?: number;
  as?: ElementType;
};

/**
 * Homegrown "staggered text" reveal (a license-free stand-in for
 * @reactbits-starter/staggered-text). Each word/character rises out of a mask
 * with an incremental delay. Respects prefers-reduced-motion.
 */
export default function StaggeredText({
  text,
  className = "",
  per = "word",
  baseDelay = 0,
  stagger = 0.06,
  as: Tag = "span",
}: Props) {
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setPlay(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const units = per === "char" ? Array.from(text) : text.split(" ");

  return (
    <Tag className={`stext ${play ? "stext--in" : ""} ${className}`.trim()} aria-label={text}>
      {units.map((u, i) => {
        const last = i === units.length - 1;
        const content = per === "char" && u === " " ? " " : u;
        return (
          <span key={i}>
            <span className="stext__mask" aria-hidden="true">
              <span
                className="stext__u"
                style={{ animationDelay: `${baseDelay + i * stagger}s` }}
              >
                {content}
              </span>
            </span>
            {per === "word" && !last ? " " : null}
          </span>
        );
      })}
    </Tag>
  );
}
