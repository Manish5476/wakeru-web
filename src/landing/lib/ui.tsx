'use client';
import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";

/* ---------- helpers ---------- */
export const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

export function usePrefersReduced() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  return reduced;
}

export function useInView<T extends HTMLElement>(threshold = 0.18, once = true) {
  const ref = useRef<T | null>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setOn(true);
          if (once) io.disconnect();
        } else if (!once) {
          setOn(false);
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);
  return { ref, on };
}

/* ---------- scroll reveal ---------- */
export function Reveal({
  children,
  delay = 0,
  y = 26,
  className = "",
  style,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const { ref, on } = useInView<HTMLDivElement>(0.14);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: on ? 1 : 0,
        transform: on ? "none" : `translateY(${y}px)`,
        transition: `opacity 0.75s ease ${delay}ms, transform 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ---------- line-mask heading reveal ---------- */
export function MaskLines({
  lines,
  className = "",
  as: Tag = "h2",
  stagger = 110,
}: {
  lines: ReactNode[];
  className?: string;
  as?: "h1" | "h2" | "h3" | "p";
  stagger?: number;
}) {
  const { ref, on } = useInView<HTMLDivElement>(0.3);
  return (
    <div ref={ref} className={`${on ? "mask-on" : ""} ${className}`}>
      <Tag className="contents">
        {lines.map((l, i) => (
          <span key={i} className="mask-line">
            <span style={{ transitionDelay: `${i * stagger}ms` }}>{l}</span>
          </span>
        ))}
      </Tag>
    </div>
  );
}

/* ---------- animated counter ---------- */
export function CountUp({
  to,
  prefix = "",
  suffix = "",
  duration = 1500,
  decimals = 0,
  className = "",
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimals?: number;
  className?: string;
}) {
  const { ref, on } = useInView<HTMLSpanElement>(0.4);
  const reduced = usePrefersReduced();
  const [val, setVal] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    if (!on) return;
    if (reduced) {
      setVal(to);
      return;
    }
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setVal(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [on, to, duration, reduced]);
  const display = decimals
    ? val.toFixed(decimals)
    : Math.round(val).toLocaleString("en-IN");
  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

/* ---------- section header ---------- */
export function Kicker({ children, dark = true }: { children: ReactNode; dark?: boolean }) {
  return (
    <p
      className={`font-mono text-[11px] sm:text-xs uppercase tracking-[0.22em] flex items-center gap-2.5 ${
        dark ? "text-coral2" : "text-coral"
      }`}
    >
      <span className={`inline-block h-px w-8 ${dark ? "bg-coral2/70" : "bg-coral/70"}`} />
      {children}
    </p>
  );
}

export function SectionHead({
  kicker,
  title,
  copy,
  dark = true,
  center = false,
}: {
  kicker: string;
  title: ReactNode[];
  copy?: ReactNode;
  dark?: boolean;
  center?: boolean;
}) {
  return (
    <div className={`max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
      <Reveal>
        <div className={center ? "flex justify-center" : ""}>
          <Kicker dark={dark}>{kicker}</Kicker>
        </div>
      </Reveal>
      <MaskLines
        as="h2"
        className={`font-display font-bold tracking-tight text-balance mt-4 text-[clamp(1.9rem,4.6vw,3.4rem)] leading-[1.04] ${
          dark ? "text-paper" : "text-ink"
        }`}
        lines={title}
      />
      {copy && (
        <Reveal delay={140}>
          <p
            className={`mt-5 text-[1.02rem] leading-relaxed max-w-2xl ${
              dark ? "text-cream/70" : "text-ink/70"
            } ${center ? "mx-auto" : ""}`}
          >
            {copy}
          </p>
        </Reveal>
      )}
    </div>
  );
}

/* ---------- avatar ---------- */
const AV_COLORS = ["#FF5A36", "#FFB350", "#35C98E", "#6AB9E9", "#E96FA4", "#9B7BE8", "#F2D34E"];
export function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 997;
  return AV_COLORS[h % AV_COLORS.length];
}
export function Avatar({
  name,
  size = 34,
  className = "",
  ring = false,
}: {
  name: string;
  size?: number;
  className?: string;
  ring?: boolean;
}) {
  const c = avatarColor(name);
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-display font-bold text-ink shrink-0 ${
        ring ? "ring-2 ring-paper" : ""
      } ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${c}, ${c}cc)`,
        fontSize: size * 0.4,
      }}
      aria-label={name}
      title={name}
    >
      {name.slice(0, 1)}
    </span>
  );
}

/* ---------- small bits ---------- */
export function Dot({ className = "bg-sea" }: { className?: string }) {
  return (
    <span className="relative inline-flex h-2 w-2">
      <span className={`absolute inline-flex h-full w-full rounded-full ${className}`} style={{ animation: "pingSoft 2.2s cubic-bezier(0,0,0.2,1) infinite" }} />
      <span className={`relative inline-flex h-2 w-2 rounded-full ${className}`} />
    </span>
  );
}

export function BtnLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost" | "cream";
  className?: string;
}) {
  const v =
    variant === "primary"
      ? "bg-coral text-paper hover:bg-coral2 shadow-[0_10px_30px_-10px_rgb(255_90_54/0.65)]"
      : variant === "cream"
      ? "bg-paper text-ink hover:bg-cream"
      : "border border-cream/25 text-cream hover:bg-cream/10 hover:border-cream/50";
  return (
    <a
      href={href}
      className={`group inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 font-semibold text-[0.95rem] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 ${v} ${className}`}
    >
      {children}
    </a>
  );
}
