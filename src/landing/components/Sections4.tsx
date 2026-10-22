'use client';
import { useState } from "react";
import { SectionHead, Reveal, Avatar, inr, Dot } from "../lib/ui";
import { IconPin, IconLink, IconCheck, IconBell, IconCalendar, IconUsers } from "../lib/icons";

/* ================= MAP ================= */
type Stop = {
  id: string;
  n: number;
  name: string;
  x: number;
  y: number;
  date: string;
  spend: number;
  notes: string;
};
const STOPS: Stop[] = [
  { id: "airport", n: 1, name: "Goa Airport", x: 352, y: 470, date: "Aug 16 · arrival", spend: 1200, notes: "🚕 Taxi to Panjim · paid by Sarah" },
  { id: "panjim", n: 2, name: "Panjim", x: 258, y: 318, date: "Aug 16–17", spend: 6840, notes: "🏨 Heritage stay + 🍛 Ritz lunch" },
  { id: "baga", n: 3, name: "Baga Beach", x: 196, y: 196, date: "Aug 17–19", spend: 21300, notes: "🏄 Water sports · 🍷 Shack dinners" },
  { id: "anjuna", n: 4, name: "Anjuna", x: 158, y: 132, date: "Aug 19", spend: 4420, notes: "🛍️ Flea market · ☕ Café Cotinga" },
  { id: "oldgoa", n: 5, name: "Old Goa", x: 316, y: 352, date: "Aug 20", spend: 3260, notes: "⛪ Basilica · 🍜 Café Bodega" },
];

export function MapSection() {
  const [sel, setSel] = useState(2);
  const s = STOPS[sel];

  return (
    <section id="explore" className="relative bg-cream text-ink noise overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 lg:py-32">
        <SectionHead
          dark={false}
          kicker="Map & travel"
          title={[<>See your trip</>, <>come together.</>]}
          copy="Every stop on one live map — with the dates and the expenses tied to each place. Tap a pin ↓"
        />

        <div className="mt-14 grid lg:grid-cols-[1.15fr_0.85fr] gap-8 items-start">
          {/* map */}
          <Reveal>
            <div className="relative rounded-[1.6rem] overflow-hidden border border-ink/12 shadow-card bg-[#123250]">
              <svg viewBox="0 0 500 560" className="w-full h-auto block" role="img" aria-label="Stylized map of the Goa trip route">
                {/* sea texture */}
                <defs>
                  <linearGradient id="sea" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#123a5c" />
                    <stop offset="1" stopColor="#0d2440" />
                  </linearGradient>
                  <linearGradient id="land" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#f3e7cd" />
                    <stop offset="1" stopColor="#e7d5b0" />
                  </linearGradient>
                </defs>
                <rect width="500" height="560" fill="url(#sea)" />
                {/* lat/long */}
                {[110, 220, 330, 440].map((y) => (
                  <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="#f5edde" strokeOpacity="0.05" />
                ))}
                {[100, 200, 300, 400].map((x) => (
                  <line key={x} x1={x} y1="0" x2={x} y2="560" stroke="#f5edde" strokeOpacity="0.05" />
                ))}
                {/* land */}
                <path
                  d="M250 40 C 330 60, 420 90, 440 170 C 465 260, 470 330, 440 400 C 415 465, 420 510, 380 545 L 500 560 L 500 0 L 300 0 C 260 10, 240 25, 250 40 Z"
                  fill="url(#land)"
                  stroke="#caa96f"
                  strokeWidth="2"
                />
                <path
                  d="M250 40 C 330 60, 420 90, 440 170 C 465 260, 470 330, 440 400 C 415 465, 420 510, 380 545"
                  fill="none"
                  stroke="#fcf8ee"
                  strokeOpacity="0.5"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                {/* topo contours */}
                <path d="M330 120 C 380 150, 400 220, 390 290 C 380 360, 400 420, 380 480" fill="none" stroke="#b08d52" strokeOpacity="0.35" strokeDasharray="1 7" strokeLinecap="round" />
                <path d="M370 90 C 430 140, 450 230, 440 310 C 430 380, 450 440, 430 500" fill="none" stroke="#b08d52" strokeOpacity="0.25" strokeDasharray="1 7" strokeLinecap="round" />
                {/* waves */}
                {[
                  [70, 120], [110, 260], [60, 400], [140, 480], [90, 60], [170, 340],
                ].map(([x, y], i) => (
                  <path key={i} d={`M${x} ${y} q 10 -7 20 0 q 10 7 20 0`} fill="none" stroke="#6ab9e9" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" />
                ))}
                {/* route */}
                <polyline
                  points={STOPS.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke="#FF5A36"
                  strokeWidth="3.5"
                  strokeDasharray="9 9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="anim-dash"
                />
                {/* stops */}
                {STOPS.map((p, i) => (
                  <g key={p.id} onClick={() => setSel(i)} className="cursor-pointer" role="button" aria-label={`Select ${p.name}`}>
                    {i === sel && <circle cx={p.x} cy={p.y} r="20" fill="#FF5A36" opacity="0.25" style={{ animation: "pingSoft 2s ease-out infinite" }} />}
                    <circle cx={p.x} cy={p.y} r={i === sel ? 15 : 12} fill={i === sel ? "#FF5A36" : "#fcf8ee"} stroke={i === sel ? "#fcf8ee" : "#FF5A36"} strokeWidth="3" className="transition-all duration-300" />
                    <text x={p.x} y={p.y + 4.5} textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="IBM Plex Mono" fill={i === sel ? "#fcf8ee" : "#FF5A36"}>
                      {p.n}
                    </text>
                    <text x={p.x + (p.x < 250 ? 22 : -22)} y={p.y + 4} textAnchor={p.x < 250 ? "start" : "end"} fontSize="12.5" fontWeight="600" fontFamily="Instrument Sans" fill={i === sel ? "#fcf8ee" : "#f5edde"} opacity={i === sel ? 1 : 0.85}>
                      {p.name}
                    </text>
                  </g>
                ))}
                {/* compass */}
                <g transform="translate(452 60)" opacity="0.7">
                  <circle r="22" fill="none" stroke="#f5edde" strokeOpacity="0.35" />
                  <path d="M0 -16 L5 6 L0 2 L-5 6 Z" fill="#FFB350" />
                  <text y="-28" textAnchor="middle" fontSize="11" fontFamily="IBM Plex Mono" fill="#f5edde">N</text>
                </g>
              </svg>

              {/* selected stop card */}
              <div key={s.id} className="anim-pop absolute bottom-4 left-4 right-4 sm:right-auto sm:w-[320px] rounded-2xl bg-ink/92 backdrop-blur-xl border border-cream/15 p-4 text-cream shadow-card">
                <div className="flex items-center justify-between">
                  <p className="font-display font-bold text-[1.1rem] text-paper flex items-center gap-2">
                    <IconPin size={15} className="text-coral2" /> {s.name}
                  </p>
                  <span className="font-mono text-[10px] text-cream/50 uppercase tracking-wider">{s.date}</span>
                </div>
                <p className="mt-1.5 text-[0.82rem] text-cream/70">{s.notes}</p>
                <p className="mt-2.5 font-mono text-[11px] text-sun">Spent here · <strong className="text-[0.95rem]">{inr(s.spend)}</strong></p>
              </div>
            </div>
          </Reveal>

          {/* stop list */}
          <div className="space-y-3">
            {STOPS.map((p, i) => (
              <Reveal key={p.id} delay={i * 90}>
                <button
                  onClick={() => setSel(i)}
                  className={`w-full text-left flex items-center gap-4 rounded-2xl border px-4.5 py-4 transition-all duration-300 px-5 ${
                    sel === i ? "bg-ink text-cream border-ink shadow-card -translate-y-0.5" : "bg-paper border-ink/10 hover:border-coral/50 hover:-translate-y-0.5"
                  }`}
                >
                  <span className={`grid place-items-center h-9 w-9 rounded-full font-mono text-[13px] font-semibold shrink-0 ${sel === i ? "bg-coral text-paper" : "bg-coral/10 text-coral"}`}>
                    {p.n}
                  </span>
                  <span className="flex-1">
                    <span className="block font-display font-bold text-[1.02rem]">{p.name}</span>
                    <span className={`block font-mono text-[10.5px] mt-0.5 uppercase tracking-wider ${sel === i ? "text-cream/55" : "text-ink/50"}`}>{p.date}</span>
                  </span>
                  <span className={`font-display font-bold tabular-nums ${sel === i ? "text-sun" : "text-ink"}`}>{inr(p.spend)}</span>
                </button>
              </Reveal>
            ))}
            <Reveal delay={480}>
              <p className="pt-3 px-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink/45">
                12 places · 5 days · route saved to trip story
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= FRIENDS ================= */
const ACTIVITY = [
  { who: "Rahul", text: "joined Goa Getaway", time: "2d ago", icon: "👋", tint: "bg-sea/10 text-sea" },
  { who: "Sarah", text: "added Dinner — ₹4,820", time: "1d ago", icon: "🍜", tint: "bg-sun/12 text-sun" },
  { who: "Priya", text: "shared 12 photos to the trip", time: "1d ago", icon: "📸", tint: "bg-coral/10 text-coral" },
  { who: "Arjun", text: "settled up with Nehal · ₹1,240", time: "22h ago", icon: "🤝", tint: "bg-sea/10 text-sea" },
  { who: "Nehal", text: "completed the trip ✓", time: "5h ago", icon: "🏁", tint: "bg-sky2/12 text-sky2" },
];

export function Friends() {
  const [copied, setCopied] = useState(false);
  const crew = ["Nehal", "Rahul", "Sarah", "Arjun", "Priya"];

  return (
    <section id="friends" className="relative bg-ink text-cream noise overflow-hidden">
      <div className="absolute inset-0 dots-dark opacity-70" aria-hidden />
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 lg:py-32">
        <SectionHead
          kicker="Friends & crew"
          title={[<>Trips are better</>, <>with <span className="text-coral2">your people.</span></>]}
          copy="Invite friends, manage groups, follow shared trips and activity — TripSplit feels like traveling together, not filing invoices."
        />

        <div className="mt-14 grid lg:grid-cols-[0.95fr_1.05fr] gap-6">
          {/* crew card */}
          <Reveal>
            <div className="h-full rounded-[1.5rem] border border-cream/10 bg-ink2/85 p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-[1.3rem] text-paper flex items-center gap-2.5">
                  <IconUsers size={20} className="text-coral2" /> Your crew
                </h3>
                <span className="font-mono text-[10.5px] uppercase tracking-wider text-cream/50">5 travelers</span>
              </div>
              <ul className="mt-6 space-y-3">
                {crew.map((n, i) => (
                  <li key={n} className="anim-pop flex items-center gap-3.5 rounded-xl bg-ink border border-cream/8 px-4 py-3 transition-colors hover:border-cream/25" style={{ animationDelay: `${i * 100}ms` }}>
                    <span className="relative">
                      <Avatar name={n} size={38} />
                      {i < 4 && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-sea ring-2 ring-ink" />}
                    </span>
                    <span className="flex-1">
                      <span className="block font-semibold text-[0.95rem]">{n}</span>
                      <span className="block text-[0.72rem] font-mono text-cream/45 uppercase tracking-wider">
                        {i === 0 ? "Trip admin · 8 trips" : i === 1 ? "6 shared trips" : i === 2 ? "4 shared trips" : i === 3 ? "9 shared trips" : "New to the crew"}
                      </span>
                    </span>
                    <Dot className={i < 4 ? "bg-sea" : "bg-sun"} />
                  </li>
                ))}
              </ul>
              {/* invite */}
              <div className="mt-6 rounded-xl border border-dashed border-coral/40 bg-coral/6 p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-coral2">Invite a friend</p>
                <div className="mt-2.5 flex gap-2">
                  <code className="flex-1 truncate rounded-lg bg-ink border border-cream/10 px-3.5 py-2.5 font-mono text-[11.5px] text-cream/70">
                    tripsplit.app/i/goa-8k2
                  </code>
                  <button
                    onClick={() => {
                      setCopied(true);
                      window.setTimeout(() => setCopied(false), 1800);
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-[0.8rem] font-bold transition-all duration-300 ${
                      copied ? "bg-sea text-ink" : "bg-coral text-paper hover:bg-coral2"
                    }`}
                  >
                    {copied ? <><IconCheck size={13} /> Copied</> : <><IconLink size={13} /> Copy</>}
                  </button>
                </div>
              </div>
            </div>
          </Reveal>

          {/* activity */}
          <Reveal delay={140}>
            <div className="h-full rounded-[1.5rem] border border-cream/10 bg-ink2/85 p-6 sm:p-8">
              <h3 className="font-display font-bold text-[1.3rem] text-paper">Trip activity</h3>
              <ul className="mt-6 relative">
                <span className="absolute left-[19px] top-3 bottom-3 w-px bg-cream/10" aria-hidden />
                {ACTIVITY.map((a, i) => (
                  <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
                    <span className={`relative z-10 grid place-items-center h-10 w-10 rounded-full border border-cream/10 bg-ink2 text-[1.05rem] shrink-0`}>{a.icon}</span>
                    <div className={`flex-1 rounded-xl border border-cream/8 bg-ink px-4 py-3 transition-all duration-300 hover:border-cream/25 hover:translate-x-1`}>
                      <p className="text-[0.9rem] leading-snug">
                        <strong className="text-paper">{a.who}</strong> <span className="text-cream/70">{a.text}</span>
                      </p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-cream/40 flex items-center gap-2">
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${a.tint.split(" ")[0]}`} /> {a.time} · Goa Getaway
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Goa Getaway ✓", "Bali Escape · live", "Europe Adventure · planned"].map((t) => (
                  <span key={t} className="rounded-full border border-cream/15 bg-cream/5 px-3.5 py-1.5 text-[0.75rem] font-mono text-cream/70 transition-colors hover:border-coral/50 hover:text-cream cursor-default">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================= REMINDERS ================= */
export function Reminders() {
  const [debt, setDebt] = useState(false);
  const [toggles, setToggles] = useState([true, true, false]);
  const labels = ["Payment reminders", "Debt nudges (friendly ones)", "Weekly trip digest"];

  return (
    <section id="reminders" className="relative bg-cream text-ink noise overflow-hidden">
      <div className="absolute inset-0 dots-light opacity-50" aria-hidden />
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <SectionHead
              dark={false}
              kicker="Smart reminders"
              title={[<>We'll remind you before the</>, <>awkward conversation does.</>]}
              copy="Friendly nudges for payments, debts and trip to-dos — written like a friend, not a collections agency."
            />
            <Reveal delay={200}>
              <div className="mt-8 space-y-3.5 max-w-md">
                {labels.map((l, i) => (
                  <button
                    key={l}
                    onClick={() => {
                      const t = [...toggles];
                      t[i] = !t[i];
                      setToggles(t);
                    }}
                    role="switch"
                    aria-checked={toggles[i]}
                    className="w-full flex items-center justify-between rounded-2xl bg-paper border border-ink/10 px-5 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift text-left"
                  >
                    <span className="font-semibold text-[0.95rem]">{l}</span>
                    <span className={`relative h-7 w-12 rounded-full transition-colors duration-300 ${toggles[i] ? "bg-sea" : "bg-ink/15"}`}>
                      <span className={`absolute top-1 h-5 w-5 rounded-full bg-paper shadow transition-all duration-300 ${toggles[i] ? "left-6" : "left-1"}`} />
                    </span>
                  </button>
                ))}
                <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink/45 pt-1">You choose the tone. We keep it kind.</p>
              </div>
            </Reveal>
          </div>

          {/* notifications */}
          <div className="relative max-w-md mx-auto w-full">
            <Reveal delay={100}>
              <div className="anim-float rounded-[1.4rem] bg-ink text-cream p-5 shadow-card border border-cream/12" style={{ ["--rot" as string]: "-1.2deg" }}>
                <div className="flex items-center gap-3">
                  <span className="grid place-items-center h-11 w-11 rounded-xl bg-coral/15 text-coral2"><IconBell size={20} /></span>
                  <div className="flex-1">
                    <p className="font-bold text-[1rem] text-paper">You still owe Rahul {inr(1240)}</p>
                    <p className="font-mono text-[10.5px] uppercase tracking-wider text-cream/50 mt-0.5">Goa Getaway · due today</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2.5">
                  <button
                    onClick={() => setDebt(true)}
                    className={`flex-1 rounded-xl py-3 text-[0.88rem] font-bold transition-all duration-300 ${debt ? "bg-sea text-ink" : "bg-coral text-paper hover:bg-coral2"}`}
                  >
                    {debt ? "✓ Settled — nice one" : "Settle Now"}
                  </button>
                  <button onClick={() => setDebt(false)} className="rounded-xl border border-cream/20 px-4 text-[0.82rem] font-semibold text-cream/70 hover:text-cream transition-colors">
                    Later
                  </button>
                </div>
              </div>
            </Reveal>
            <Reveal delay={220}>
              <div className="anim-float mt-4 ml-8 rounded-[1.4rem] bg-paper border border-ink/10 p-5 shadow-lift" style={{ ["--rot" as string]: "1.4deg", animationDelay: "1.2s" }}>
                <div className="flex items-center gap-3">
                  <span className="grid place-items-center h-11 w-11 rounded-xl bg-sun/15 text-[1.2rem]">🏨</span>
                  <div>
                    <p className="font-bold text-[0.98rem]">Hotel balance {inr(9000)} due in 2 days</p>
                    <p className="font-mono text-[10.5px] uppercase tracking-wider text-ink/45 mt-0.5 flex items-center gap-1.5"><IconCalendar size={12} /> Booking #ZH-8841 · split 4 ways</p>
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={330}>
              <div className="anim-float mt-4 rounded-[1.4rem] bg-paper border border-ink/10 p-5 shadow-lift w-[88%]" style={{ ["--rot" as string]: "-0.8deg", animationDelay: "2s" }}>
                <div className="flex items-center gap-3">
                  <span className="grid place-items-center h-11 w-11 rounded-xl bg-sea/15 text-[1.2rem]">🏖️</span>
                  <div>
                    <p className="font-bold text-[0.98rem]">Custom: “Pack beach towels”</p>
                    <p className="font-mono text-[10.5px] uppercase tracking-wider text-ink/45 mt-0.5">Tomorrow · 9:00 AM · set by Priya</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
