'use client';
import { useEffect, useRef, useState } from "react";
import { CountUp, MaskLines, Reveal, inr, Avatar, Dot, usePrefersReduced } from "../lib/ui";
import { IconArrow, IconCheck, IconPin, IconPlane, IconTicket } from "../lib/icons";
import { IMG } from "../lib/images";

type Dest = {
  id: string;
  name: string;
  emoji: string;
  meta: string;
  total: number;
  per: number;
  img: string;
  expenses: { icon: string; title: string; amt: number; by: string }[];
  balances: { name: string; amt: number; up: boolean }[];
};

const DESTS: Dest[] = [
  {
    id: "bali",
    name: "Bali Escape",
    emoji: "🌴",
    meta: "6 travelers · 7 days",
    total: 86420,
    per: 14403,
    img: IMG.heroBali,
    expenses: [
      { icon: "🏨", title: "Hotel", amt: 36000, by: "Arjun" },
      { icon: "🍜", title: "Dinner", amt: 4820, by: "Nehal" },
      { icon: "🚕", title: "Taxi", amt: 1250, by: "Sarah" },
      { icon: "🏄", title: "Surfing", amt: 7200, by: "Rahul" },
    ],
    balances: [
      { name: "Arjun", amt: 8240, up: true },
      { name: "Nehal", amt: 2180, up: false },
      { name: "Sarah", amt: 1420, up: false },
      { name: "Rahul", amt: 4640, up: false },
    ],
  },
  {
    id: "santorini",
    name: "Santorini Days",
    emoji: "🏛️",
    meta: "4 travelers · 6 days",
    total: 118650,
    per: 29662,
    img: IMG.heroSantorini,
    expenses: [
      { icon: "🏨", title: "Cliffside Suite", amt: 52400, by: "Sarah" },
      { icon: "🍷", title: "Wine Night", amt: 6850, by: "Priya" },
      { icon: "⛴️", title: "Ferry", amt: 3200, by: "Arjun" },
      { icon: "🌅", title: "Catamaran", amt: 9600, by: "Nehal" },
    ],
    balances: [
      { name: "Sarah", amt: 11260, up: true },
      { name: "Priya", amt: 2840, up: false },
      { name: "Arjun", amt: 4610, up: false },
      { name: "Nehal", amt: 3810, up: false },
    ],
  },
  {
    id: "tokyo",
    name: "Tokyo Neon",
    emoji: "🏮",
    meta: "5 travelers · 6 days",
    total: 142300,
    per: 28460,
    img: IMG.heroTokyo,
    expenses: [
      { icon: "🏨", title: "Shinjuku Stay", amt: 48800, by: "Rahul" },
      { icon: "🍣", title: "Sushi Omakase", amt: 9400, by: "Sarah" },
      { icon: "🚄", title: "Rail Pass", amt: 14500, by: "Nehal" },
      { icon: "🎮", title: "Akihabara", amt: 5120, by: "Arjun" },
    ],
    balances: [
      { name: "Rahul", amt: 9820, up: true },
      { name: "Sarah", amt: 1960, up: false },
      { name: "Nehal", amt: 3440, up: false },
      { name: "Arjun", amt: 4420, up: false },
    ],
  },
];

const PILLS = ["Plan", "Book", "Track", "Split", "Settle", "Discover", "Remember"];
const TICKER = ["GOA", "LISBON", "KYOTO", "UBUD", "SANTORINI", "MARRAKECH", "PATAGONIA", "REYKJAVÍK", "TOKYO", "THE ALPS", "ZANZIBAR", "SAIGON"];

export default function Hero() {
  const [di, setDi] = useState(0);
  const [y, setY] = useState(0);
  const bgRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReduced();
  const d = DESTS[di];

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setY(window.scrollY));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <section id="top" className="relative overflow-hidden bg-ink noise">
      {/* cinematic backdrop */}
      <div ref={bgRef} className="absolute inset-0 will-change-transform" style={{ transform: reduced ? undefined : `translateY(${y * 0.28}px)` }}>
        {DESTS.map((dest, i) => (
          <img
            key={dest.id}
            src={dest.img}
            alt=""
            aria-hidden
            loading={i === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 h-[118%] w-full object-cover transition-opacity duration-[1400ms] ease-out ${
              i === di ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/78 to-ink/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 pt-32 lg:pt-40 pb-14">
        {/* boarding-pass ticket */}
        <Reveal delay={60}>
          <div className="inline-flex items-center gap-3 rounded-full border border-cream/18 bg-ink/45 backdrop-blur-md px-4 py-2">
            <IconTicket size={16} className="text-sun" />
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-cream/85">
              Boarding · Group travel, sorted
            </span>
            <Dot />
          </div>
        </Reveal>

        <div className="mt-7 grid lg:grid-cols-[1.04fr_0.96fr] gap-14 lg:gap-10 items-center">
          {/* left: message */}
          <div>
            <MaskLines
              as="h1"
              stagger={120}
              className="font-display font-bold text-paper tracking-[-0.02em] text-[clamp(2.5rem,6.2vw,4.6rem)] leading-[1.01]"
              lines={[
                <>Your trip.</>,
                <>Your people.</>,
                <>
                  Your expenses. <span className="text-coral">Sorted.</span>
                </>,
              ]}
            />
            <Reveal delay={320}>
              <p className="mt-6 max-w-xl text-[1.06rem] leading-relaxed text-cream/75">
                TripSplit brings trip planning, shared expenses, settlements, and travel memories together — so you can
                spend less time doing math and more time enjoying the journey.
              </p>
            </Reveal>
            <Reveal delay={420}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#get-started"
                  className="group inline-flex items-center gap-2.5 rounded-full bg-coral hover:bg-coral2 px-7 py-4 font-bold text-paper transition-all duration-300 hover:-translate-y-0.5 shadow-[0_16px_44px_-12px_rgb(255_90_54/0.75)]"
                >
                  Create Your Trip
                  <IconArrow size={17} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                </a>
                <a
                  href="#how"
                  className="group inline-flex items-center gap-2.5 rounded-full border border-cream/25 hover:border-cream/60 hover:bg-cream/8 px-7 py-4 font-semibold text-cream transition-all duration-300"
                >
                  See How It Works
                  <span className="text-coral2 transition-transform duration-300 group-hover:translate-x-1">↓</span>
                </a>
              </div>
            </Reveal>
            <Reveal delay={520}>
              <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-cream/55">
                Built for friends, couples, families &amp; travel groups.
              </p>
            </Reveal>
          </div>

          {/* right: living dashboard */}
          <div className="relative lg:pl-2">
            {/* floating expense cards */}
            {d.expenses.slice(0, 2).map((e, i) => (
              <div
                key={d.id + e.title + "l"}
                className="anim-pop absolute -left-6 sm:-left-12 z-20 hidden md:block anim-float"
                style={{ top: i === 0 ? "-26px" : "36%", ["--rot" as string]: i === 0 ? "-4deg" : "-2deg", animationDelay: `${i * 0.9}s`, animationDuration: `${6.5 + i}s` }}
              >
                <ExpenseChip e={e} />
              </div>
            ))}
            {d.expenses.slice(2).map((e, i) => (
              <div
                key={d.id + e.title + "r"}
                className="anim-pop absolute -right-4 sm:-right-10 z-20 hidden md:block anim-float"
                style={{ top: i === 0 ? "8%" : "66%", ["--rot" as string]: i === 0 ? "3.5deg" : "2deg", animationDelay: `${0.5 + i * 0.8}s`, animationDuration: `${7 + i}s` }}
              >
                <ExpenseChip e={e} />
              </div>
            ))}

            {/* main trip card */}
            <Reveal delay={200} y={34}>
              <div className="relative rounded-[1.6rem] border border-cream/12 bg-ink2/88 backdrop-blur-xl shadow-card overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-coral via-sun to-sea" />
                <div className="p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[1.45rem] leading-none">{d.emoji}</span>
                        <h2 className="font-display font-bold text-[1.5rem] text-paper tracking-tight">{d.name}</h2>
                      </div>
                      <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-cream/55 flex items-center gap-2">
                        <IconPin size={12} className="text-coral2" /> {d.meta}
                      </p>
                    </div>
                    <span className="stamp text-sea text-[10px] px-3 py-2.5 font-semibold uppercase shrink-0">Live</span>
                  </div>

                  {/* destination switch */}
                  <div className="mt-5 flex gap-1.5 p-1.5 rounded-full bg-ink/70 border border-cream/8 w-fit" role="tablist" aria-label="Switch destination">
                    {DESTS.map((dest, i) => (
                      <button
                        key={dest.id}
                        role="tab"
                        aria-selected={i === di}
                        onClick={() => setDi(i)}
                        className={`px-3.5 py-1.5 rounded-full text-[0.78rem] font-semibold transition-all duration-300 ${
                          i === di ? "bg-coral text-paper shadow-lg" : "text-cream/60 hover:text-paper"
                        }`}
                      >
                        {dest.emoji} {dest.name.split(" ")[0]}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-ink/70 border border-cream/8 p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cream/50">Total trip spend</p>
                      <p className="mt-1.5 font-display font-bold text-[1.75rem] text-paper tabular-nums tracking-tight">
                        <CountUp key={d.id + "t"} to={d.total} prefix="₹" duration={1300} />
                      </p>
                      {/* sparkline */}
                      <svg viewBox="0 0 120 30" className="mt-2 w-full h-6" aria-hidden>
                        <polyline
                          points="0,24 14,20 28,22 42,14 56,17 70,9 84,12 98,5 112,8 120,3"
                          fill="none"
                          stroke="#35C98E"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <div className="rounded-2xl bg-ink/70 border border-cream/8 p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cream/50">Per person</p>
                      <p className="mt-1.5 font-display font-bold text-[1.75rem] text-sun tabular-nums tracking-tight">
                        <CountUp key={d.id + "p"} to={d.per} prefix="₹" duration={1500} />
                      </p>
                      <div className="mt-3 flex -space-x-2">
                        {["Arjun", "Nehal", "Sarah", "Rahul", "Priya", "Dev"].slice(0, d.meta[0] === "4" ? 4 : d.meta[0] === "5" ? 5 : 6).map((n) => (
                          <Avatar key={n} name={n} size={24} ring />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* group balance */}
                  <div className="mt-5 rounded-2xl bg-ink/70 border border-cream/8 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cream/50">Group balance</p>
                      <Dot className="bg-sea" />
                    </div>
                    <ul className="mt-3 space-y-2">
                      {d.balances.map((b, i) => (
                        <li key={b.name} className="anim-pop flex items-center justify-between" style={{ animationDelay: `${i * 90}ms` }}>
                          <span className="flex items-center gap-2.5">
                            <Avatar name={b.name} size={26} />
                            <span className="text-[0.9rem] font-medium text-cream/85">{b.name}</span>
                          </span>
                          <span className={`font-mono text-[0.88rem] font-semibold tabular-nums ${b.up ? "text-sea" : "text-coral2"}`}>
                            {b.up ? "+" : "−"}
                            <CountUp key={d.id + b.name} to={b.amt} prefix="₹" duration={1200 + i * 150} />
                          </span>
                        </li>
                      ))}
                    </ul>
                    <a
                      href="#settle"
                      className="group mt-4 flex items-center justify-center gap-2 rounded-xl bg-paper text-ink font-bold text-[0.9rem] py-3 hover:bg-cream transition-colors duration-300"
                    >
                      Settle Up
                      <IconArrow size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* one app strip */}
        <Reveal delay={150} y={20}>
          <div className="mt-16 lg:mt-20 rounded-[1.4rem] border border-cream/10 bg-ink/55 backdrop-blur-md px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-7">
            <p className="font-display font-bold text-paper text-[1.05rem] whitespace-nowrap">
              One app for the <span className="text-coral2">entire</span> trip.
            </p>
            <ul className="flex flex-wrap gap-2.5">
              {PILLS.map((p, i) => (
                <li
                  key={p}
                  className="anim-pop inline-flex items-center gap-1.5 rounded-full border border-sea/30 bg-sea/10 px-3.5 py-1.5 text-[0.82rem] font-semibold text-sea transition-transform duration-300 hover:scale-105"
                  style={{ animationDelay: `${300 + i * 90}ms` }}
                >
                  <IconCheck size={12} /> {p}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      {/* destination ticker */}
      <div className="relative z-10 border-t border-cream/10 bg-ink/80 backdrop-blur-sm overflow-hidden py-3.5" aria-hidden>
        <div className="anim-marquee flex w-max items-center gap-8">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center gap-8">
              {TICKER.map((t) => (
                <span key={t + dup} className="flex items-center gap-8 font-mono text-[11px] uppercase tracking-[0.3em] text-cream/45">
                  {t} <IconPlane size={13} className="text-coral2/70" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExpenseChip({ e }: { e: { icon: string; title: string; amt: number; by: string } }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-cream/14 bg-ink2/92 backdrop-blur-xl px-4 py-3 shadow-card min-w-[190px]">
      <span className="grid place-items-center h-10 w-10 rounded-xl bg-cream/8 text-[1.15rem]">{e.icon}</span>
      <span>
        <span className="block text-[0.85rem] font-semibold text-paper leading-tight">
          {e.title} <span className="font-mono text-[0.8rem] text-cream/90">· {inr(e.amt)}</span>
        </span>
        <span className="block text-[0.72rem] text-cream/55">Paid by {e.by}</span>
      </span>
    </div>
  );
}
