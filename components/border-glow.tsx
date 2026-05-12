"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";

type BorderGlowProps = {
  children: ReactNode;
  className?: string;
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  animated?: boolean;
  colors?: string[];
  fillOpacity?: number;
};

type CSSVariableProperties = CSSProperties & Record<`--${string}`, string | number>;

const GRADIENT_POSITIONS = [
  "80% 55%",
  "69% 34%",
  "8% 6%",
  "41% 38%",
  "86% 85%",
  "82% 18%",
  "51% 4%",
];
const GRADIENT_KEYS = [
  "--gradient-one",
  "--gradient-two",
  "--gradient-three",
  "--gradient-four",
  "--gradient-five",
  "--gradient-six",
  "--gradient-seven",
] as const;
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

function parseHSL(hslStr: string) {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);

  if (!match) {
    return { h: 40, s: 80, l: 80 };
  }

  return {
    h: Number.parseFloat(match[1]),
    s: Number.parseFloat(match[2]),
    l: Number.parseFloat(match[3]),
  };
}

function buildGlowVars(glowColor: string, intensity: number) {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const keys = ["", "-60", "-50", "-40", "-30", "-20", "-10"];
  const vars: CSSVariableProperties = {};

  for (let index = 0; index < opacities.length; index += 1) {
    vars[`--glow-color${keys[index]}`] =
      `hsl(${base} / ${Math.min(opacities[index] * intensity, 100)}%)`;
  }

  return vars;
}

function buildGradientVars(colors: string[]) {
  const safeColors = colors.length > 0 ? colors : ["#fc3030", "#ffb000", "#ffffff"];
  const vars: CSSVariableProperties = {};

  for (let index = 0; index < 7; index += 1) {
    const colorIndex = Math.min(COLOR_MAP[index], safeColors.length - 1);
    vars[GRADIENT_KEYS[index]] =
      `radial-gradient(at ${GRADIENT_POSITIONS[index]}, ${safeColors[colorIndex]} 0px, transparent 50%)`;
  }

  vars["--gradient-base"] = `linear-gradient(${safeColors[0]} 0 100%)`;
  return vars;
}

function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3);
}

function easeInCubic(x: number) {
  return x * x * x;
}

function animateValue({
  start = 0,
  end = 100,
  duration = 1000,
  delay = 0,
  ease = easeOutCubic,
  onUpdate,
  onEnd,
}: {
  start?: number;
  end?: number;
  duration?: number;
  delay?: number;
  ease?: (x: number) => number;
  onUpdate: (value: number) => void;
  onEnd?: () => void;
}) {
  const startTime = performance.now() + delay;

  function tick() {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    onUpdate(start + (end - start) * ease(progress));

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      onEnd?.();
    }
  }

  window.setTimeout(() => requestAnimationFrame(tick), delay);
}

export function BorderGlow({
  children,
  className = "",
  edgeSensitivity = 30,
  glowColor = "40 80 80",
  backgroundColor = "#120F17",
  borderRadius = 28,
  glowRadius = 40,
  glowIntensity = 1,
  coneSpread = 25,
  animated = false,
  colors = ["#c084fc", "#f472b6", "#38bdf8"],
  fillOpacity = 0.5,
}: BorderGlowProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  const getCenterOfElement = useCallback((el: HTMLElement) => {
    const { width, height } = el.getBoundingClientRect();
    return [width / 2, height / 2] as const;
  }, []);

  const getEdgeProximity = useCallback(
    (el: HTMLElement, x: number, y: number) => {
      const [centerX, centerY] = getCenterOfElement(el);
      const dx = x - centerX;
      const dy = y - centerY;
      const kx = dx === 0 ? Infinity : centerX / Math.abs(dx);
      const ky = dy === 0 ? Infinity : centerY / Math.abs(dy);

      return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    },
    [getCenterOfElement],
  );

  const getCursorAngle = useCallback(
    (el: HTMLElement, x: number, y: number) => {
      const [centerX, centerY] = getCenterOfElement(el);
      const dx = x - centerX;
      const dy = y - centerY;

      if (dx === 0 && dy === 0) {
        return 0;
      }

      const radians = Math.atan2(dy, dx);
      let degrees = radians * (180 / Math.PI) + 90;

      if (degrees < 0) {
        degrees += 360;
      }

      return degrees;
    },
    [getCenterOfElement],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const card = cardRef.current;

      if (!card) {
        return;
      }

      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const edge = getEdgeProximity(card, x, y);
      const angle = getCursorAngle(card, x, y);

      card.style.setProperty("--edge-proximity", `${(edge * 100).toFixed(3)}`);
      card.style.setProperty("--cursor-angle", `${angle.toFixed(3)}deg`);
    },
    [getCursorAngle, getEdgeProximity],
  );

  useEffect(() => {
    if (!animated || !cardRef.current) {
      return;
    }

    const card = cardRef.current;
    const angleStart = 110;
    const angleEnd = 465;

    card.classList.add("sweep-active");
    card.style.setProperty("--cursor-angle", `${angleStart}deg`);

    animateValue({
      duration: 500,
      onUpdate: (value) => card.style.setProperty("--edge-proximity", String(value)),
    });
    animateValue({
      ease: easeInCubic,
      duration: 1500,
      end: 50,
      onUpdate: (value) => {
        const angle = (angleEnd - angleStart) * (value / 100) + angleStart;
        card.style.setProperty("--cursor-angle", `${angle}deg`);
      },
    });
    animateValue({
      ease: easeOutCubic,
      delay: 1500,
      duration: 2250,
      start: 50,
      end: 100,
      onUpdate: (value) => {
        const angle = (angleEnd - angleStart) * (value / 100) + angleStart;
        card.style.setProperty("--cursor-angle", `${angle}deg`);
      },
    });
    animateValue({
      ease: easeInCubic,
      delay: 2500,
      duration: 1500,
      start: 100,
      end: 0,
      onUpdate: (value) => card.style.setProperty("--edge-proximity", String(value)),
      onEnd: () => card.classList.remove("sweep-active"),
    });
  }, [animated]);

  const style: CSSVariableProperties = {
    "--card-bg": backgroundColor,
    "--edge-sensitivity": edgeSensitivity,
    "--border-radius": `${borderRadius}px`,
    "--glow-padding": `${glowRadius}px`,
    "--cone-spread": coneSpread,
    "--fill-opacity": fillOpacity,
    ...buildGlowVars(glowColor, glowIntensity),
    ...buildGradientVars(colors),
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className={`border-glow-card ${className}`}
      style={style}
    >
      <span className="edge-light" />
      <div className="border-glow-inner">{children}</div>
    </div>
  );
}
