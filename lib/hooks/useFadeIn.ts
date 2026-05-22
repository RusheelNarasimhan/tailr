"use client";

import { useEffect, useRef } from "react";

export function useFadeIn(delay = 0, offsetY = 20) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.opacity = "0";
    el.style.transform = `translateY(${offsetY}px)`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.transition = `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`;
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          }, 40);
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, offsetY]);

  return ref;
}
