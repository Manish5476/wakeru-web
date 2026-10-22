'use client';
import { SectionHead, Reveal, MaskLines, Avatar, useInView, inr } from "../lib/ui";
import { IconSplit, IconRoute, IconWallet, IconUsers, IconChart, IconTrophy, IconBell, IconCompass, IconCamera } from "../lib/icons";

/* ================= PROBLEM ================= */
const MESSAGES = [
  { who: "Rahul", text: "Who paid for the hotel?? 🏨", side: "left", rot: "-2.5deg" },
  { who: "Sarah", text: "How much did everyone spend again?", side: "right", rot: "1.8deg" },
  { who: "Nehal", text: "Wait… I owe you ₹2,400?", side: "left", rot: "-1.2deg" },
  { who: "Priya", text: "Did someone forget to add the taxi? 🚕", side: "right", rot: "2.4deg" },
  { who: "Arjun", text: "Where's that expense screenshot?", side: "left", rot: "-2deg" },
  { who: "Rahul", text: "Can someone PLEASE calculate everything 😩", side: "right", rot: "1.4deg" },
];

export function Problem() {
  return (
    <section id="problem" className="relative bg-cream text-ink noise overflow-hidden">
      <div className="absolute inset-0 dots-light opacity-60" aria-hidden />
      {/* scribble route */}
      <svg className="absolute -right-24 top-16 w-[420px] text-coral/25 hidden lg:block" viewBox="0 0 400 300" fill="none" aria-hidden>
        <path d="M10 40c90-30 130 60 210 30s60-60 170-20" stroke="currentColor" strokeWidth="2.5" strokeDasharray="7 8" strokeLinecap="round" className="anim-dash" />
        <circle cx="10" cy="40" r="6" fill="currentColor" />
        <circle cx="390" cy="50" r="6" fill="currentColor" />
      </svg>

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 lg:py-32">
        <SectionHead
          dark={false}
          kicker="Sound familiar?"
          title={[<>The trip is easy.</>, <>Keeping track of everything isn't.</>]}
          copy="Every group trip starts with excitement — and ends with a messy thread of screenshots, half-remembered amounts and one friend doing math at 1 a.m."
        />

        <div className="mt-14 grid lg:grid-cols-[1fr_0.9fr] gap-12 items-center">
          {/* chat chaos */}
          <div className="relative">
            <div className="grid sm:grid-cols-2 gap-4">
              {MESSAGES.map((m, i) => (
                <Reveal key={i} delay={i * 110} y={30}>
                  <div
                    className={`rounded-2xl border px-4.5 py-3.5 shadow-lift transition-all duration-300 rotate-(--rot) hover:rotate-0 hover:-translate-y-1 ${
                      m.side === "left" ? "bg-paper border-ink/8 rounded-bl-md" : "bg-ink text-cream border-transparent rounded-br-md sm:translate-y-5"
                    }`}
                    style={{ ["--rot" as string]: m.rot }}
                  >
                    <p className={`font-mono text-[10px] uppercase tracking-[0.18em] ${m.side === "left" ? "text-coral" : "text-sun"}`}>{m.who} · 11:4{2 + (i % 6)} PM</p>
                    <p className={`mt-1.5 text-[0.95rem] font-medium leading-snug ${m.side === "left" ? "text-ink" : "text-cream"}`}>{m.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            {/* notification bubble */}
            <Reveal delay={700}>
              <div className="mt-8 mx-auto w-fit flex items-center gap-3 rounded-full bg-ink text-cream pl-3 pr-5 py-2.5 shadow-card anim-float" style={{ ["--rot" as string]: "-1deg" }}>
                <span className="grid place-items-center h-8 w-8 rounded-full bg-coral/20 text-coral2"><IconBell size={16} /></span>
                <span className="text-[0.82rem] font-medium">3 unread · “expense-split-final-FINAL.xlsx”</span>
              </div>
            </Reveal>
          </div>

          {/* the mess visual */}
          <div className="relative">
            <Reveal delay={200} y={36}>
              <div className="relative rounded-[1.5rem] bg-paper border border-ink/10 shadow-card p-6 rotate-[1.6deg] transition-transform duration-500 hover:rotate-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/45">expense-split-final-FINAL(2).xlsx</p>
                <div className="mt-4 space-y-2.5">
                  {[
                    ["Hotel", "36000", "Arjun??", true],
                    ["Dinner", "4820", "Nehal", false],
                    ["Taxi", "—", "who took it?", true],
                    ["Surfing", "7200", "Rahul", false],
                    ["???", "", "screenshot lost", true],
                  ].map(([a, b, c, bad], i) => (
                    <div key={i} className={`grid grid-cols-3 gap-2 rounded-lg px-3 py-2 text-[0.82rem] font-mono ${bad ? "bg-coral/10 text-coral" : "bg-cream text-ink/75"}`}>
                      <span>{a}</span>
                      <span className="text-right">{b}</span>
                      <span className="text-right opacity-70">{c}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-[0.85rem] font-semibold text-ink/60">
                  Total: <span className="line-through decoration-coral decoration-2">₹52,020</span>{" "}
                  <span className="text-coral">₹49,?20</span> — doesn't add up. Again.
                </p>
                <span className="stamp absolute -right-4 -top-4 text-coral bg-paper px-4 py-3 text-[10px] font-bold uppercase shadow-lift">Math error</span>
              </div>
            </Reveal>
          </div>
        </div>

        {/* pivot */}
        <div className="mt-20 text-center">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink/45">Deep breath. There's a better way ↓</p>
          </Reveal>
          <MaskLines
            as="h3"
            className="font-display font-bold tracking-tight text-ink mt-4 text-[clamp(2rem,5vw,3.6rem)]"
            lines={[<>TripSplit fixes <span className="underline-stroke">all of it.</span></>]}
          />
        </div>
      </div>
    </section>
  );
}

/* ================= VALUE MODULES BENTO ================= */
function PlanPreview() {
  return (
    <svg viewBox="0 0 320 110" className="w-full" aria-hidden>
      <path d="M14 88 C 80 88, 90 30, 160 30 S 250 78, 306 26" fill="none" stroke="#FF5A36" strokeWidth="2.5" strokeDasharray="7 7" className="anim-dash" strokeLinecap="round" />
      {[
        { x: 14, y: 88, l: "Day 1" },
        { x: 160, y: 30, l: "Day 3" },
        { x: 306, y: 26, l: "Day 6" },
      ].map((p) => (
        <g key={p.l}>
          <circle cx={p.x} cy={p.y} r="7" fill="#101b2b" stroke="#FFB350" strokeWidth="2.4" />
          <text x={p.x - 12} y={p.y + 22} fill="#f5edde" opacity="0.6" fontSize="10" fontFamily="IBM Plex Mono">{p.l}</text>
        </g>
      ))}
    </svg>
  );
}

function SplitPreview() {
  const arcs = [
    { c: "#FF5A36", off: 0 },
    { c: "#FFB350", off: 25 },
    { c: "#35C98E", off: 50 },
    { c: "#6AB9E9", off: 75 },
  ];
  return (
    <svg viewBox="0 0 120 120" className="w-28" aria-hidden>
      {arcs.map((a, i) => (
        <circle
          key={i}
          cx="60"
          cy="60"
          r="44"
          fill="none"
          stroke={a.c}
          strokeWidth="15"
          strokeDasharray="66 210.5"
          strokeDashoffset={-a.off * 2.765}
          transform="rotate(-90 60 60)"
          className="transition-all duration-500"
        />
      ))}
      <text x="60" y="57" textAnchor="middle" fill="#fcf8ee" fontSize="13" fontWeight="700" fontFamily="Bricolage Grotesque">÷ 4</text>
      <text x="60" y="73" textAnchor="middle" fill="#f5edde" opacity="0.55" fontSize="9" fontFamily="IBM Plex Mono">each</text>
    </svg>
  );
}

function FinancePreview() {
  const { ref, on } = useInView<HTMLDivElement>(0.4);
  return (
    <div ref={ref} className="w-full max-w-[240px]">
      <div className="flex justify-between font-mono text-[10px] text-cream/55 uppercase tracking-widest">
        <span>Budget</span>
        <span className="text-sea">68%</span>
      </div>
      <div className="mt-2 h-3 rounded-full bg-ink overflow-hidden border border-cream/10">
        <div className="h-full rounded-full bg-gradient-to-r from-coral to-sun transition-[width] duration-[1400ms] ease-out" style={{ width: on ? "68%" : "6%" }} />
      </div>
      <p className="mt-2 font-mono text-[11px] text-cream/60 tabular-nums">{inr(68420)} / {inr(100000)}</p>
    </div>
  );
}

function FriendsPreview() {
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2.5">
        {["Nehal", "Rahul", "Sarah", "Arjun"].map((n, i) => (
          <span key={n} className="anim-pop" style={{ animationDelay: `${i * 140}ms` }}>
            <Avatar name={n} size={34} ring />
          </span>
        ))}
        <span className="anim-pop grid place-items-center h-[34px] w-[34px] rounded-full bg-ink border-2 border-dashed border-cream/40 text-cream/70 text-base ring-2 ring-paper" style={{ animationDelay: "600ms" }}>+</span>
      </div>
      <span className="ml-4 rounded-full bg-sea/15 border border-sea/30 text-sea px-3 py-1 text-[0.72rem] font-mono uppercase tracking-wider">2 pending invites</span>
    </div>
  );
}

function InsightsPreview() {
  const { ref, on } = useInView<HTMLDivElement>(0.4);
  const bars = [34, 58, 42, 76, 52, 88];
  return (
    <div ref={ref} className="flex items-end gap-2 h-20 w-full max-w-[220px]">
      {bars.map((b, i) => (
        <div key={i} className="flex-1 rounded-t-md origin-bottom transition-transform duration-700 ease-out" style={{ height: `${b}%`, background: i === 5 ? "#FF5A36" : "#31486a", transform: on ? "scaleY(1)" : "scaleY(0.08)", transitionDelay: `${i * 90}ms` }} />
      ))}
    </div>
  );
}

function MemoriesPreview() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="h-16 w-20 rounded-lg bg-ink3 border border-cream/10 rotate-[-6deg] grid place-items-center text-xl">🏝️</div>
        <div className="h-16 w-20 rounded-lg bg-ink3 border border-cream/10 rotate-[5deg] -ml-10 mt-3 grid place-items-center text-xl shadow-card">🚂</div>
        <div className="h-16 w-20 rounded-lg bg-ink3 border border-cream/10 rotate-[-2deg] -ml-9 mt-3 grid place-items-center text-xl shadow-card">⛰️</div>
      </div>
      <div>
        <p className="font-display font-bold text-paper text-[0.95rem]">Goa Getaway</p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-cream/50 mt-1">5 days · 27 moments</p>
        <span className="stamp inline-block mt-2 text-sun text-[9px] px-2.5 py-1.5 uppercase">Wrapped ✓</span>
      </div>
    </div>
  );
}

function DiscoverPreview() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {[
        { emoji: "🏨", name: "Villa Serenidad", price: "₹24K" },
        { emoji: "🍽️", name: "Thalassa", price: "₹3.5K" },
        { emoji: "🏄", name: "Scuba Shack", price: "₹4.2K" },
        { emoji: "🍹", name: "Curlies", price: "₹2.8K" },
      ].map((v) => (
        <div key={v.name} className="rounded-lg bg-ink border border-cream/10 px-2.5 py-2">
          <span className="text-sm">{v.emoji}</span>
          <p className="font-semibold text-[0.72rem] text-paper mt-0.5 truncate">{v.name}</p>
          <p className="font-mono text-[0.65rem] text-sun">{v.price}</p>
        </div>
      ))}
    </div>
  );
}

function OCRPreview() {
  const { ref, on } = useInView<HTMLDivElement>(0.4);
  return (
    <div ref={ref} className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm">🔍</span>
        <div className="flex-1 h-1.5 rounded-full bg-ink overflow-hidden">
          <div className="h-full rounded-full bg-sea transition-all duration-700" style={{ width: on ? "100%" : "0%" }} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">📝</span>
        <div className="flex-1 h-1.5 rounded-full bg-ink overflow-hidden">
          <div className="h-full rounded-full bg-sun transition-all duration-700 delay-200" style={{ width: on ? "100%" : "0%" }} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">🍽️</span>
        <div className="flex-1 h-1.5 rounded-full bg-ink overflow-hidden">
          <div className="h-full rounded-full bg-coral transition-all duration-700 delay-400" style={{ width: on ? "100%" : "0%" }} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">✓</span>
        <div className="flex-1 h-1.5 rounded-full bg-ink overflow-hidden">
          <div className="h-full rounded-full bg-sky2 transition-all duration-700 delay-600" style={{ width: on ? "100%" : "0%" }} />
        </div>
      </div>
      <p className="font-mono text-[0.65rem] text-cream/40 mt-1">4-stage OCR · line-item assignment</p>
    </div>
  );
}

const MODULES: {
  icon: React.ReactNode;
  title: string;
  copy: string;
  preview: React.ReactNode;
  span: string;
}[] = [
  { icon: <IconRoute size={20} />, title: "Plan", copy: "Build your itinerary and organize destinations, stops and travel days — before the journey begins.", preview: <PlanPreview />, span: "lg:col-span-3" },
  { icon: <IconSplit size={20} />, title: "Split", copy: "Track and split group expenses effortlessly — equally or exactly how you want.", preview: <SplitPreview />, span: "lg:col-span-3" },
  { icon: <IconWallet size={20} />, title: "Finance", copy: "Understand your trip budget, spending, debts and transactions in one calm place.", preview: <FinancePreview />, span: "lg:col-span-2" },
  { icon: <IconUsers size={20} />, title: "Friends", copy: "Invite friends, manage groups, and travel together — not in separate chats.", preview: <FriendsPreview />, span: "lg:col-span-2" },
  { icon: <IconChart size={20} />, title: "Insights", copy: "See where your money went and how your trip really performed.", preview: <InsightsPreview />, span: "lg:col-span-2" },
  { icon: <IconTrophy size={20} />, title: "Memories", copy: "Turn every trip into achievements, stories and a year-in-review you'll actually revisit.", preview: <MemoriesPreview />, span: "lg:col-span-6" },
  { icon: <IconCompass size={20} />, title: "Discover", copy: "Search verified stays, dining and adventures — compare up to 4 venues side-by-side.", preview: <DiscoverPreview />, span: "lg:col-span-3" },
  { icon: <IconCamera size={20} />, title: "AI OCR", copy: "Snap the bill — 4-stage scanner parses dishes, prices, tax and tips automatically.", preview: <OCRPreview />, span: "lg:col-span-3" },
];

export function ValueModules() {
  return (
    <section id="features" className="relative bg-ink text-cream noise overflow-hidden">
      <div className="absolute inset-0 topo" aria-hidden />
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 lg:py-32">
        <SectionHead
          kicker="The whole journey, covered"
          title={[<>Everything your trip needs.</>, <><span className="text-coral2">In one place.</span></>]}
          copy="Six modules that follow your trip from the first idea to the final memory — hover around, everything's alive."
        />

        <div className="mt-14 grid lg:grid-cols-6 gap-4">
          {MODULES.map((m, i) => (
            <Reveal key={m.title} delay={(i % 3) * 110} className={`${m.span} ${m.title === "Memories" ? "" : ""}`}>
              <article className="group relative h-full rounded-[1.4rem] border border-cream/10 bg-ink2/80 p-6 sm:p-7 overflow-hidden transition-all duration-500 hover:border-coral/40 hover:-translate-y-1.5 hover:shadow-card">
                <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-coral/0 blur-2xl transition-all duration-700 group-hover:bg-coral/15" aria-hidden />
                <div className="flex items-center gap-3.5">
                  <span className="grid place-items-center h-11 w-11 rounded-xl bg-coral/12 text-coral2 border border-coral/20 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                    {m.icon}
                  </span>
                  <h3 className="font-display font-bold text-[1.3rem] text-paper tracking-tight">{m.title}</h3>
                  <span className="ml-auto font-mono text-[10px] text-cream/35 tracking-widest">0{i + 1}</span>
                </div>
                <p className="mt-3.5 text-[0.94rem] leading-relaxed text-cream/65 max-w-md">{m.copy}</p>
                <div className={`mt-6 ${m.title === "Memories" ? "" : ""}`}>{m.preview}</div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
