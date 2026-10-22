'use client';
import { useEffect, useState } from "react";
import { SectionHead, Reveal, Avatar, CountUp, inr } from "../lib/ui";
import { IconArrow, IconCheck, IconCamera, IconWallet, IconReceipt, IconSpark } from "../lib/icons";

/* ================= FINANCE ================= */
const CATS = [
  { name: "Accommodation", pct: 42, color: "#FF5A36", amt: 28740 },
  { name: "Food", pct: 24, color: "#FFB350", amt: 16420 },
  { name: "Transport", pct: 18, color: "#6AB9E9", amt: 12315 },
  { name: "Activities", pct: 11, color: "#35C98E", amt: 7527 },
  { name: "Other", pct: 5, color: "#9B7BE8", amt: 3418 },
];
const ACTIVITY = [
  { icon: "🍜", title: "Dinner — Beach Shack", amt: -4820, by: "Nehal", when: "Today · 8:30 PM" },
  { icon: "🏄", title: "Surf lesson × 4", amt: -7200, by: "Rahul", when: "Today · 9:10 AM" },
  { icon: "💸", title: "Sarah settled Arjun", amt: 1420, by: "Sarah", when: "Yesterday · 9:02 PM" },
  { icon: "🚕", title: "Airport taxi", amt: -1250, by: "Sarah", when: "Yesterday · 4:15 PM" },
  { icon: "🏨", title: "Hotel — nights 1–4", amt: -36000, by: "Arjun", when: "Mon · 2:00 PM" },
];

export function Finance() {
  const [tab, setTab] = useState<"budget" | "categories" | "activity">("budget");
  const [range, setRange] = useState("All trip");
  const [active, setActive] = useState(0);

  const R = 54;
  const C = 2 * Math.PI * R;
  let acc = 0;

  return (
    <section id="finance" className="relative bg-ink text-cream noise overflow-hidden">
      <div className="absolute inset-0 topo" aria-hidden />
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 lg:py-32">
        <SectionHead
          kicker="Trip finance"
          title={[<>Know exactly where</>, <>your money is going.</>]}
          copy="Budgets, trends, categories, transactions, bills and debts — a calm money dashboard that feels like travel, not banking software."
        />

        <Reveal delay={150}>
          <div className="mt-12 rounded-[1.6rem] border border-cream/10 bg-ink2/85 overflow-hidden shadow-card">
            {/* tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream/8 px-6 py-4">
              <div className="flex gap-1.5 p-1.5 rounded-full bg-ink border border-cream/8" role="tablist" aria-label="Finance views">
                {(["budget", "categories", "activity"] as const).map((t) => (
                  <button
                    key={t}
                    role="tab"
                    aria-selected={tab === t}
                    onClick={() => setTab(t)}
                    className={`px-4 sm:px-5 py-2 rounded-full text-[0.82rem] font-bold capitalize transition-all duration-300 ${
                      tab === t ? "bg-coral text-paper shadow-lg" : "text-cream/55 hover:text-cream"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                {["All trip", "Last 3 days"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`px-3.5 py-1.5 rounded-full font-mono text-[10.5px] uppercase tracking-wider transition-all duration-300 ${
                      range === r ? "bg-cream/15 text-paper border border-cream/25" : "text-cream/45 border border-transparent hover:text-cream"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {tab === "budget" && (
                <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 anim-pop">
                  <div>
                    <div className="flex items-end justify-between flex-wrap gap-3">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream/50">Trip budget</p>
                        <p className="font-display font-bold text-[2.6rem] text-paper tabular-nums tracking-tight">{inr(100000)}</p>
                      </div>
                      <span className="rounded-full bg-sea/12 border border-sea/30 text-sea px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider">On track</span>
                    </div>
                    <div className="mt-5 h-5 rounded-full bg-ink border border-cream/10 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-coral via-sun to-sea relative card-sheen" style={{ width: "68.4%" }} />
                    </div>
                    <div className="mt-3 flex justify-between font-mono text-[11px] text-cream/55 tabular-nums">
                      <span>Spent <strong className="text-cream/90">{inr(68420)}</strong></span>
                      <span>Remaining <strong className="text-sea">{inr(31580)}</strong></span>
                    </div>
                    <div className="mt-7 grid sm:grid-cols-3 gap-3">
                      {[
                        { k: "Burn per day", v: "₹9,774", note: "7 days in" },
                        { k: "Top category", v: "🏨 Stay", note: "42% of spend" },
                        { k: "Biggest expense", v: "₹36,000", note: "Hotel, by Arjun" },
                      ].map((s) => (
                        <div key={s.k} className="rounded-xl bg-ink border border-cream/8 p-4 transition-colors hover:border-coral/40">
                          <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-cream/45">{s.k}</p>
                          <p className="mt-1 font-display font-bold text-[1.15rem] text-paper">{s.v}</p>
                          <p className="text-[0.72rem] text-cream/50 mt-0.5">{s.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* trend */}
                  <div className="rounded-2xl bg-ink border border-cream/8 p-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream/50">Daily spend · {range.toLowerCase()}</p>
                    <div className="mt-5 flex items-end gap-2.5 h-40">
                      {[62, 38, 84, 55, 96, 71, 44].map((h, i) => (
                        <div key={i} className="group relative flex-1">
                          <div
                            className="anim-grow w-full rounded-t-lg bg-gradient-to-t from-coral/70 to-sun/80 transition-colors group-hover:from-coral group-hover:to-sun"
                            style={{ height: `${h * 1.5}px`, animationDelay: `${i * 80}ms` }}
                          />
                          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md bg-paper text-ink font-mono text-[10px] px-2 py-1 whitespace-nowrap shadow-lift">
                            {inr(h * 118)}
                          </span>
                          <p className="mt-2 text-center font-mono text-[9.5px] text-cream/40">D{i + 1}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tab === "categories" && (
                <div className="grid md:grid-cols-[auto_1fr] gap-10 items-center anim-pop">
                  <div className="relative mx-auto">
                    <svg viewBox="0 0 140 140" className="w-56 h-56 -rotate-90">
                      {CATS.map((c, i) => {
                        const seg = (
                          <circle
                            key={c.name}
                            cx="70" cy="70" r={R}
                            fill="none"
                            stroke={c.color}
                            strokeWidth={active === i ? 20 : 15}
                            strokeDasharray={`${(c.pct / 100) * C - 3} ${C}`}
                            strokeDashoffset={-acc}
                            strokeLinecap="butt"
                            className="transition-all duration-400 cursor-pointer"
                            onMouseEnter={() => setActive(i)}
                            opacity={active === i ? 1 : 0.55}
                          />
                        );
                        acc += (c.pct / 100) * C;
                        return seg;
                      })}
                    </svg>
                    <div className="absolute inset-0 grid place-items-center text-center">
                      <div>
                        <p className="font-display font-bold text-[1.5rem] text-paper tabular-nums">{CATS[active].pct}%</p>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-cream/55">{CATS[active].name}</p>
                      </div>
                    </div>
                  </div>
                  <ul className="space-y-2.5">
                    {CATS.map((c, i) => (
                      <li
                        key={c.name}
                        onMouseEnter={() => setActive(i)}
                        className={`flex items-center gap-3.5 rounded-xl px-4 py-3 border transition-all duration-300 cursor-pointer ${
                          active === i ? "bg-cream/8 border-cream/20" : "border-transparent hover:bg-cream/4"
                        }`}
                      >
                        <span className="h-3.5 w-3.5 rounded-full" style={{ background: c.color }} />
                        <span className="font-semibold text-[0.95rem] flex-1">{c.name}</span>
                        <span className="font-mono text-[11px] text-cream/50">{c.pct}%</span>
                        <span className="font-display font-bold tabular-nums text-[1.02rem]">{inr(c.amt)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {tab === "activity" && (
                <div className="anim-pop">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream/50 mb-4">Transactions · {range.toLowerCase()}</p>
                  <ul className="divide-y divide-cream/8">
                    {(range === "All trip" ? ACTIVITY : ACTIVITY.slice(0, 2)).map((a, i) => (
                      <li key={a.title + range} className="anim-pop flex items-center gap-4 py-3.5" style={{ animationDelay: `${i * 80}ms` }}>
                        <span className="grid place-items-center h-11 w-11 rounded-xl bg-cream/6 text-[1.2rem]">{a.icon}</span>
                        <span className="flex-1">
                          <span className="block font-semibold text-[0.95rem]">{a.title}</span>
                          <span className="block text-[0.75rem] text-cream/50 font-mono mt-0.5">{a.by} · {a.when}</span>
                        </span>
                        <span className={`font-display font-bold tabular-nums text-[1.08rem] ${a.amt > 0 ? "text-sea" : "text-cream/90"}`}>
                          {a.amt > 0 ? "+" : ""}{inr(a.amt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 flex items-center gap-2.5 rounded-xl bg-sea/8 border border-sea/25 px-4 py-3 text-[0.85rem] text-sea">
                    <IconWallet size={16} /> Bills, debts and transactions stay in sync with every split.
                  </div>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= SETTLEMENT ================= */
const TRANSFERS = [
  { from: "Nehal", to: "Arjun", amt: 2140 },
  { from: "Sarah", to: "Arjun", amt: 1280 },
  { from: "Rahul", to: "Arjun", amt: 1400 },
];

export function Settlement() {
  const [settled, setSettled] = useState<boolean[]>([false, false, false]);
  const allDone = settled.every(Boolean);

  return (
    <section id="settle" className="relative bg-cream text-ink noise overflow-hidden">
      <div className="absolute inset-0 dots-light opacity-50" aria-hidden />
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 lg:py-32">
        <SectionHead
          dark={false}
          kicker="Settlements"
          title={[<>At the end of the trip, everyone knows</>, <>exactly what they owe.</>]}
          copy="TripSplit simplifies the group balance into the fewest possible payments — no more “wait, who pays whom?” group-chat archaeology."
        />

        <div className="mt-14 grid lg:grid-cols-2 gap-6">
          {/* balances */}
          <Reveal>
            <div className="h-full rounded-[1.5rem] bg-ink text-cream p-6 sm:p-8 shadow-card relative overflow-hidden">
              <div className="absolute -top-20 -left-20 h-56 w-56 rounded-full bg-coral/15 blur-3xl" aria-hidden />
              <h3 className="font-display font-bold text-[1.35rem] text-paper flex items-center gap-2.5">
                Final trip balance
                <span className="stamp text-sea text-[9px] px-2.5 py-1.5 uppercase">Verified</span>
              </h3>
              <ul className="mt-6 space-y-3.5">
                {[
                  { name: "Arjun", amt: 4820, up: true },
                  { name: "Nehal", amt: 2140, up: false },
                  { name: "Sarah", amt: 1280, up: false },
                  { name: "Rahul", amt: 1400, up: false },
                ].map((b, i) => (
                  <li key={b.name} className={`flex items-center justify-between rounded-xl border px-4 py-3.5 transition-colors ${b.up ? "border-sea/30 bg-sea/8" : "border-cream/10 bg-cream/4"}`}>
                    <span className="flex items-center gap-3">
                      <Avatar name={b.name} size={34} />
                      <span>
                        <span className="block font-semibold">{b.name}</span>
                        <span className={`block text-[0.72rem] font-mono uppercase tracking-wider ${b.up ? "text-sea" : "text-cream/45"}`}>
                          {b.up ? "gets back" : "owes"}
                        </span>
                      </span>
                    </span>
                    <CountUp
                      to={b.amt}
                      prefix={b.up ? "+₹" : "−₹"}
                      duration={1200 + i * 150}
                      className={`font-display font-bold text-[1.35rem] tabular-nums ${b.up ? "text-sea" : "text-coral2"}`}
                    />
                  </li>
                ))}
              </ul>
              <p className="mt-6 font-mono text-[11px] text-cream/50 leading-relaxed">
                Net zero ✓ — every +₹ is covered by a −₹. The math always closes.
              </p>
            </div>
          </Reveal>

          {/* simplified transfers */}
          <Reveal delay={150}>
            <div className="h-full rounded-[1.5rem] bg-paper border border-ink/10 p-6 sm:p-8 shadow-lift">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-[1.35rem]">Simplified settlement</h3>
                <span className="rounded-full bg-coral/10 text-coral px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-wider font-semibold">3 payments, not 6</span>
              </div>
              <ul className="mt-6 space-y-4">
                {TRANSFERS.map((t, i) => (
                  <li key={t.from} className="anim-pop rounded-2xl border border-ink/8 bg-cream px-4 py-4" style={{ animationDelay: `${i * 120}ms` }}>
                    <div className="flex items-center gap-3">
                      <Avatar name={t.from} size={32} />
                      <svg viewBox="0 0 60 12" className="w-14 h-3 text-coral shrink-0" aria-hidden>
                        <line x1="0" y1="6" x2="50" y2="6" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" className="anim-dash" style={{ animationDuration: "3s" }} />
                        <path d="M50 1l8 5-8 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <Avatar name={t.to} size={32} />
                      <span className="text-[0.9rem] font-semibold flex-1">
                        {t.from} pays {t.to}
                      </span>
                      <span className="font-display font-bold text-[1.15rem] tabular-nums">{inr(t.amt)}</span>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => {
                          const n = [...settled];
                          n[i] = !n[i];
                          setSettled(n);
                        }}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.8rem] font-bold transition-all duration-300 ${
                          settled[i] ? "bg-sea text-ink" : "bg-ink text-paper hover:bg-ink3 hover:-translate-y-0.5"
                        }`}
                      >
                        {settled[i] ? <><IconCheck size={14} /> Settled</> : "Mark settled"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className={`mt-6 rounded-xl border px-4 py-3.5 text-center transition-all duration-500 ${allDone ? "bg-sea/12 border-sea/40 text-ink" : "bg-cream border-ink/8 text-ink/55"}`}>
                {allDone ? (
                  <p className="font-display font-bold text-[1.02rem] flex items-center justify-center gap-2">
                    <IconCheck size={17} className="text-sea" /> Trip fully settled — everyone's square. 🎉
                  </p>
                ) : (
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em]">Tap “Mark settled” as payments land</p>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================= RECEIPTS ================= */
export function Receipts() {
  const [phase, setPhase] = useState<"idle" | "scan" | "done">("idle");

  useEffect(() => {
    if (phase !== "scan") return;
    const t = window.setTimeout(() => setPhase("done"), 1900);
    return () => window.clearTimeout(t);
  }, [phase]);

  return (
    <section id="receipts" className="relative bg-ink text-cream noise overflow-hidden">
      <div className="absolute inset-0 topo" aria-hidden />
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 lg:py-32">
        <SectionHead
          kicker="Receipts"
          title={[<>Never lose a receipt again.</>]}
          copy="Snap it or upload it — TripSplit reads the receipt and files it under the right expense, category, payer and date. Watch ↓"
        />

        <div className="mt-14 grid md:grid-cols-2 gap-10 items-center max-w-5xl">
          {/* receipt */}
          <Reveal>
            <div className="relative mx-auto w-[290px]">
              <div className="relative rounded-lg bg-paper text-ink px-6 pt-7 pb-9 shadow-card rotate-[-2deg] transition-transform duration-500 hover:rotate-0 overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-3" style={{ background: "radial-gradient(circle at 8px -2px, #0c1420 5px, transparent 5.5px)", backgroundSize: "16px 12px" }} aria-hidden />
                {phase === "scan" && (
                  <span className="absolute inset-x-3 h-[3px] rounded-full bg-coral shadow-[0_0_18px_4px_rgb(255_90_54/0.7)]" style={{ animation: "scanline 1.7s ease-in-out infinite" }} aria-hidden />
                )}
                <p className="text-center font-mono font-semibold text-[13px] tracking-[0.12em]">THE PALM GROVE</p>
                <p className="text-center font-mono text-[10px] text-ink/55 mt-1">BAGA BEACH ROAD · GOA · GSTIN 30AAK···</p>
                <div className="my-4 border-t border-dashed border-ink/30" />
                <div className="font-mono text-[11.5px] space-y-1.5">
                  <div className="flex justify-between"><span>Deluxe Room × 4 nts</span><span>16,000</span></div>
                  <div className="flex justify-between"><span>Breakfast add-on</span><span>1,600</span></div>
                  <div className="flex justify-between"><span>Tour desk fee</span><span>900</span></div>
                  <div className="flex justify-between border-t border-dashed border-ink/30 pt-2 mt-2 font-bold text-[13px]"><span>TOTAL</span><span>₹18,500</span></div>
                  <div className="flex justify-between text-ink/55 text-[10px]"><span>18 AUG 2026 · 11:12</span><span>CARD ••4821</span></div>
                </div>
                <svg viewBox="0 0 200 30" className="mt-4 w-full h-7 text-ink" aria-hidden>
                  {Array.from({ length: 42 }).map((_, i) => (
                    <rect key={i} x={i * 4.8} y="0" width={i % 3 === 0 ? 2.6 : 1.2} height="30" fill="currentColor" opacity={i % 4 === 0 ? 0.9 : 0.65} />
                  ))}
                </svg>
                <p className="mt-2 text-center font-mono text-[9.5px] text-ink/50 tracking-[0.3em]">THANK YOU · VISIT AGAIN</p>
              </div>

              <div className="mt-6 flex justify-center gap-3">
                {phase === "idle" && (
                  <>
                    <button
                      onClick={() => setPhase("scan")}
                      className="inline-flex items-center gap-2 rounded-full bg-coral hover:bg-coral2 px-5 py-3 text-[0.88rem] font-bold text-paper transition-all duration-300 hover:-translate-y-0.5 shadow-[0_10px_28px_-10px_rgb(255_90_54/0.8)]"
                    >
                      <IconCamera size={16} /> Scan receipt
                    </button>
                    <button
                      onClick={() => setPhase("scan")}
                      className="inline-flex items-center gap-2 rounded-full border border-cream/25 hover:border-cream/60 px-5 py-3 text-[0.88rem] font-semibold text-cream transition-colors"
                    >
                      <IconReceipt size={16} /> Upload photo
                    </button>
                  </>
                )}
                {phase === "scan" && (
                  <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-coral2 flex items-center gap-2">
                    <IconSpark size={14} /> Reading receipt…
                  </span>
                )}
                {phase === "done" && (
                  <button onClick={() => setPhase("idle")} className="font-mono text-[12px] uppercase tracking-[0.2em] text-cream/60 hover:text-cream underline underline-offset-4 transition-colors">
                    ↺ Scan another
                  </button>
                )}
              </div>
            </div>
          </Reveal>

          {/* result */}
          <Reveal delay={140}>
            <div className="relative">
              <div className="absolute left-[-40px] top-1/2 hidden md:flex flex-col items-center gap-2 text-coral2" aria-hidden>
                <IconArrow size={22} className="rotate-0" />
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] writing-mode-vertical" style={{ writingMode: "vertical-rl" }}>becomes</span>
              </div>
              {phase !== "done" ? (
                <div className="rounded-[1.5rem] border border-dashed border-cream/25 p-8 min-h-[280px] grid place-items-center">
                  {phase === "idle" ? (
                    <div className="text-center">
                      <span className="grid place-items-center mx-auto h-14 w-14 rounded-2xl bg-cream/6 border border-cream/12 text-cream/50"><IconReceipt size={24} /></span>
                      <p className="mt-4 font-display font-bold text-paper text-[1.1rem]">Your expense appears here</p>
                      <p className="mt-1.5 text-[0.85rem] text-cream/55 max-w-[260px] mx-auto">Scan or upload the receipt on the left to see TripSplit file it automatically.</p>
                    </div>
                  ) : (
                    <div className="w-full max-w-sm space-y-3.5">
                      {[70, 45, 85, 55].map((w, i) => (
                        <div key={i} className="h-9 rounded-xl bg-cream/6 card-sheen" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="anim-pop rounded-[1.5rem] border border-sea/35 bg-ink2 p-6 sm:p-7 shadow-card">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-sea flex items-center gap-2"><IconCheck size={13} /> Expense created</p>
                    <span className="font-mono text-[10px] text-cream/45">auto-filed</span>
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    <span className="grid place-items-center h-14 w-14 rounded-2xl bg-coral/12 text-[1.6rem]">🏨</span>
                    <div>
                      <h3 className="font-display font-bold text-[1.45rem] text-paper leading-tight">Hotel — {inr(18500)}</h3>
                      <p className="font-mono text-[11px] text-cream/55 mt-0.5">The Palm Grove · 4 nights</p>
                    </div>
                  </div>
                  <dl className="mt-5 grid grid-cols-2 gap-3">
                    {[
                      ["Category", "Accommodation", "bg-coral/10 text-coral2"],
                      ["Paid by", "Nehal", "bg-sun/10 text-sun"],
                      ["Date", "Aug 18, 2026", "bg-cream/8 text-cream/80"],
                      ["Split", "4 ways · equal", "bg-sea/10 text-sea"],
                    ].map(([k, v, tone]) => (
                      <div key={k} className="rounded-xl bg-ink border border-cream/8 px-3.5 py-2.5">
                        <dt className="font-mono text-[9px] uppercase tracking-[0.18em] text-cream/45">{k}</dt>
                        <dd className="mt-1"><span className={`rounded-full px-2.5 py-1 text-[0.75rem] font-bold ${tone}`}>{v}</span></dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-5 text-[0.85rem] text-cream/60">Receipt stays attached — anyone in the trip can view it, forever.</p>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
