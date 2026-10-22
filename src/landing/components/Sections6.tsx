'use client';
import { useState } from "react";
import { SectionHead, Reveal, Avatar, inr, CountUp } from "../lib/ui";
import { IconCheck, IconCross, IconArrow, IconLock, IconUserCtl, IconShield, IconDevice, IconEye, IconDownload, IconPlane } from "../lib/icons";

/* ================= COMPARISON ================= */
const TYPICAL = ["Only track expenses", "No trip planning", "No travel timeline", "No achievements", "No trip insights", "No social travel experience"];
const TRIPSPLIT_DOES = ["Plan trips", "Track expenses", "Split intelligently", "Manage settlements", "Track budgets", "Analyze spending", "Travel with friends", "Build memories", "Earn achievements"];

export function Comparison() {
  return (
    <section id="compare" className="relative bg-cream text-ink noise overflow-hidden">
      <div className="absolute inset-0 dots-light opacity-50" aria-hidden />
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 lg:py-32">
        <SectionHead
          dark={false}
          kicker="Why TripSplit"
          title={[<>Not just an</>, <>expense splitter.</>]}
          copy="Splitting the bill is one scene of the trip. TripSplit is the whole movie."
        />

        <div className="mt-14 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
          <Reveal>
            <div className="h-full rounded-[1.5rem] bg-paper border border-ink/12 p-7 shadow-lift opacity-90 relative overflow-hidden rotate-[-0.6deg]">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">Typical expense apps</p>
              <h3 className="mt-2 font-display font-bold text-[1.5rem] text-ink/70">The calculator era</h3>
              <ul className="mt-6 space-y-3">
                {TYPICAL.map((t, i) => (
                  <li key={t} className="anim-pop flex items-center gap-3 text-ink/60" style={{ animationDelay: `${i * 80}ms` }}>
                    <span className="grid place-items-center h-6.5 w-6.5 rounded-full bg-coral/12 text-coral shrink-0" style={{ height: 26, width: 26 }}>
                      <IconCross size={12} />
                    </span>
                    <span className="text-[0.95rem] font-medium">{t}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-7 font-mono text-[10.5px] text-ink/35 uppercase tracking-wider">Great for dinner. Lost on a 7-day trip.</p>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div className="h-full rounded-[1.5rem] bg-ink text-cream p-7 shadow-card relative overflow-hidden border border-coral/30 rotate-[0.6deg] transition-transform duration-500 hover:rotate-0">
              <span className="stamp absolute right-5 top-5 text-sun text-[9px] px-3 py-2 uppercase">All-in-one</span>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-coral2">TripSplit</p>
              <h3 className="mt-2 font-display font-bold text-[1.5rem] text-paper">The whole journey</h3>
              <ul className="mt-6 grid sm:grid-cols-2 gap-x-4 gap-y-3">
                {TRIPSPLIT_DOES.map((t, i) => (
                  <li key={t} className="anim-pop flex items-center gap-3" style={{ animationDelay: `${i * 70}ms` }}>
                    <span className="grid place-items-center rounded-full bg-sea/15 text-sea shrink-0" style={{ height: 26, width: 26 }}>
                      <IconCheck size={12} />
                    </span>
                    <span className="text-[0.92rem] font-medium text-cream/85">{t}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-7 font-mono text-[10.5px] text-cream/50 uppercase tracking-wider">From “where are we going?” to “remember when…?”</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================= HOW IT WORKS ================= */
const STEPS = [
  { n: "01", title: "Create your trip", copy: "Give it a name, destination, dates and budget. Sixty seconds, tops.", icon: "🗺️" },
  { n: "02", title: "Invite your crew", copy: "Bring your friends into the trip with a single link.", icon: "👥" },
  { n: "03", title: "Track everything", copy: "Add expenses, stops, receipts and activities as they happen.", icon: "🧾" },
  { n: "04", title: "Settle & remember", copy: "See final balances, settle up in fewer payments, relive the trip.", icon: "🤝" },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative bg-ink text-cream noise overflow-hidden">
      <div className="absolute inset-0 topo" aria-hidden />
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 lg:py-32">
        <SectionHead
          kicker="How it works"
          title={[<>Four steps between you</>, <>and a perfectly run trip.</>]}
          copy="Follow the route ↓"
        />

        <div className="relative mt-16">
          {/* route line */}
          <svg className="absolute left-0 right-0 top-[26px] w-full h-10 hidden md:block" viewBox="0 0 1200 40" preserveAspectRatio="none" aria-hidden>
            <path d="M20 20 C 200 -10, 400 50, 600 20 S 1000 -10, 1180 20" fill="none" stroke="#FF5A36" strokeWidth="2.5" strokeDasharray="8 9" className="anim-dash" strokeLinecap="round" opacity="0.65" />
            <g style={{ animation: "planePulse 2.4s ease-in-out infinite" }}>
              <path d="M1150 12 l26 8 -26 8 6 -8z" fill="#FFB350" transform="rotate(4 1160 20)" />
            </g>
          </svg>

          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 140}>
                <li className="group relative h-full rounded-[1.4rem] border border-cream/10 bg-ink2/80 p-6 pt-8 transition-all duration-500 hover:border-coral/45 hover:-translate-y-2 hover:shadow-card">
                  <span className="absolute -top-5 left-6 grid place-items-center h-11 w-11 rounded-full bg-coral text-paper font-mono font-semibold text-[13px] shadow-[0_10px_26px_-8px_rgb(255_90_54/0.8)] transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                    {s.n}
                  </span>
                  <span className="text-[1.7rem]">{s.icon}</span>
                  <h3 className="mt-3 font-display font-bold text-[1.2rem] text-paper">{s.title}</h3>
                  <p className="mt-2 text-[0.9rem] leading-relaxed text-cream/60">{s.copy}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>

        <Reveal delay={300}>
          <p className="mt-12 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-cream/45 flex items-center justify-center gap-2.5">
            <IconPlane size={14} className="text-coral2" /> Average time from idea to fully planned group trip: 4 minutes
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= MOBILE ================= */
const SCREENS = ["Dashboard", "Expense", "Settle", "Map", "Alerts"] as const;

function PhoneScreen({ screen }: { screen: (typeof SCREENS)[number] }) {
  return (
    <div className="anim-pop h-full flex flex-col text-[11px]">
      {/* status bar */}
      <div className="flex items-center justify-between px-5 pt-3 font-mono text-[9px] text-cream/60">
        <span>9:41</span>
        <span className="flex gap-1"><span className="h-1.5 w-1.5 rounded-full bg-cream/50" /><span className="h-1.5 w-1.5 rounded-full bg-cream/50" /><span className="h-1.5 w-3 rounded-full bg-sea" /></span>
      </div>

      {screen === "Dashboard" && (
        <div className="px-4 pt-4 space-y-3">
          <p className="font-display font-bold text-[15px] text-paper">Bali Escape 🌴</p>
          <div className="rounded-xl bg-cream/8 border border-cream/10 p-3">
            <p className="font-mono text-[8px] uppercase tracking-widest text-cream/50">Total spend</p>
            <p className="font-display font-bold text-[20px] text-paper tabular-nums">{inr(86420)}</p>
            <div className="mt-2 h-1.5 rounded-full bg-ink overflow-hidden"><div className="h-full w-[68%] rounded-full bg-gradient-to-r from-coral to-sun" /></div>
          </div>
          {["🏨 Hotel · ₹36,000", "🍜 Dinner · ₹4,820", "🏄 Surfing · ₹7,200"].map((t) => (
            <div key={t} className="rounded-lg bg-cream/6 border border-cream/8 px-3 py-2 text-cream/85">{t}</div>
          ))}
        </div>
      )}
      {screen === "Expense" && (
        <div className="px-4 pt-4 space-y-3">
          <p className="font-display font-bold text-[15px] text-paper">Add expense</p>
          <div className="rounded-xl bg-cream/8 border border-cream/10 p-3 text-center">
            <p className="font-display font-bold text-[26px] text-paper tabular-nums">{inr(4820)}</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {["🍜", "🚕", "🏨", "🎟️"].map((e) => (
              <span key={e} className="grid place-items-center h-10 rounded-lg bg-cream/6 border border-cream/8 text-[16px]">{e}</span>
            ))}
          </div>
          <div className="flex -space-x-2 px-1">{["Nehal", "Rahul", "Sarah", "Arjun"].map((n) => <Avatar key={n} name={n} size={24} ring />)}</div>
          <span className="block rounded-lg bg-coral text-paper text-center font-bold py-2.5">Split 4 ways →</span>
        </div>
      )}
      {screen === "Settle" && (
        <div className="px-4 pt-4 space-y-2.5">
          <p className="font-display font-bold text-[15px] text-paper">Settle up</p>
          {[["Nehal", "Arjun", 2140], ["Sarah", "Arjun", 1280], ["Rahul", "Arjun", 1400]].map(([f, t, a]) => (
            <div key={f as string} className="flex items-center gap-2 rounded-lg bg-cream/6 border border-cream/8 px-3 py-2.5">
              <Avatar name={f as string} size={22} />
              <IconArrow size={11} className="text-coral2" />
              <Avatar name={t as string} size={22} />
              <span className="ml-auto font-bold text-paper tabular-nums">{inr(a as number)}</span>
            </div>
          ))}
          <span className="block rounded-lg bg-sea text-ink text-center font-bold py-2.5">✓ All settled</span>
        </div>
      )}
      {screen === "Map" && (
        <div className="px-4 pt-4 h-full flex flex-col">
          <p className="font-display font-bold text-[15px] text-paper">Route · Day 3</p>
          <div className="mt-3 flex-1 rounded-xl bg-[#123a5c] border border-cream/10 relative overflow-hidden min-h-[150px]">
            <svg viewBox="0 0 200 150" className="absolute inset-0 w-full h-full">
              <path d="M20 120 C 60 90, 90 110, 120 70 S 170 40, 185 25" fill="none" stroke="#FF5A36" strokeWidth="2.5" strokeDasharray="6 6" className="anim-dash" strokeLinecap="round" />
              {[[20, 120], [120, 70], [185, 25]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="5" fill="#fcf8ee" stroke="#FF5A36" strokeWidth="2.5" />
              ))}
            </svg>
            <span className="absolute bottom-2 left-2 rounded-md bg-ink/85 px-2 py-1 font-mono text-[8px] text-cream/80">📍 Baga → Anjuna</span>
          </div>
        </div>
      )}
      {screen === "Alerts" && (
        <div className="px-4 pt-4 space-y-2.5">
          <p className="font-display font-bold text-[15px] text-paper">Reminders</p>
          {[
            ["🔔", "You owe Rahul ₹1,240", "due today"],
            ["🏨", "Hotel balance due in 2 days", "booking #ZH-8841"],
            ["🏖️", "Pack beach towels", "tomorrow 9 AM"],
          ].map(([e, t, s]) => (
            <div key={t} className="flex items-center gap-2.5 rounded-lg bg-cream/6 border border-cream/8 px-3 py-2.5">
              <span className="text-[15px]">{e}</span>
              <span>
                <span className="block font-semibold text-cream text-[10.5px]">{t}</span>
                <span className="block font-mono text-[8px] uppercase tracking-wider text-cream/45">{s}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Mobile() {
  const [screen, setScreen] = useState<(typeof SCREENS)[number]>("Dashboard");

  return (
    <section id="mobile" className="relative bg-cream text-ink noise overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div className="order-2 lg:order-1">
            <SectionHead
              dark={false}
              kicker="On the go"
              title={[<>Everything you need,</>, <>wherever the trip takes you.</>]}
              copy="Add an expense from a beach shack, check the route on a train, settle up from the airport lounge. The whole trip lives in your pocket."
            />
            <Reveal delay={200}>
              <div className="mt-8 flex flex-wrap gap-2.5" role="tablist" aria-label="Phone screens">
                {SCREENS.map((s) => (
                  <button
                    key={s}
                    role="tab"
                    aria-selected={screen === s}
                    onClick={() => setScreen(s)}
                    className={`rounded-full px-5 py-2.5 text-[0.86rem] font-bold transition-all duration-300 ${
                      screen === s ? "bg-ink text-paper shadow-lift -translate-y-0.5" : "bg-paper border border-ink/12 text-ink/60 hover:border-ink/40"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Reveal>
            <Reveal delay={280}>
              <ul className="mt-8 space-y-2.5 max-w-md">
                {["Offline-first expense entry", "Camera receipt scanning", "Live balances for the whole crew", "Push reminders that don't nag"].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[0.95rem] font-medium text-ink/80">
                    <span className="grid place-items-center rounded-full bg-sea/15 text-sea" style={{ height: 22, width: 22 }}><IconCheck size={12} /></span>
                    {f}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* phone */}
          <div className="order-1 lg:order-2 flex justify-center">
            <Reveal y={40}>
              <div className="relative">
                <div className="absolute -inset-10 rounded-full bg-gradient-to-tr from-coral/25 via-sun/15 to-sea/20 blur-3xl" aria-hidden />
                {/* floating chips */}
                <div className="anim-float absolute -left-16 sm:-left-24 top-16 z-20 hidden sm:block rounded-xl bg-ink text-cream px-3.5 py-2.5 shadow-card text-[11px] font-semibold" style={{ ["--rot" as string]: "-4deg" }}>
                  🍜 Dinner split · 4 ways
                </div>
                <div className="anim-float absolute -right-14 sm:-right-20 bottom-24 z-20 hidden sm:block rounded-xl bg-ink text-cream px-3.5 py-2.5 shadow-card text-[11px] font-semibold" style={{ ["--rot" as string]: "3deg", animationDelay: "1.4s" }}>
                  ✅ Rahul settled ₹1,240
                </div>

                <div className="relative w-[270px] sm:w-[300px] rounded-[2.6rem] bg-ink p-[10px] shadow-card border border-ink/40">
                  <div className="relative rounded-[2rem] bg-ink2 overflow-hidden h-[540px] border border-cream/10">
                    <span className="absolute top-2.5 left-1/2 -translate-x-1/2 h-[22px] w-[92px] rounded-full bg-ink z-10" aria-hidden />
                    <div key={screen} className="h-full pt-8">
                      <PhoneScreen screen={screen} />
                    </div>
                    <div className="absolute bottom-0 inset-x-0 h-14 bg-ink/90 backdrop-blur border-t border-cream/10 grid place-items-center">
                      <span className="h-1 w-24 rounded-full bg-cream/25" />
                    </div>
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

/* ================= SECURITY ================= */
const TRUST = [
  { icon: <IconLock size={18} />, title: "Secure authentication", copy: "Protected sign-in to your account." },
  { icon: <IconUserCtl size={18} />, title: "Account controls", copy: "Your profile, your preferences, your rules." },
  { icon: <IconShield size={18} />, title: "Privacy controls", copy: "Choose who can see your trips and activity." },
  { icon: <IconDevice size={18} />, title: "Secure sessions", copy: "Review and sign out of active sessions." },
  { icon: <IconEye size={18} />, title: "Protected trip information", copy: "Expenses visible only to your trip crew." },
];

export function Security() {
  return (
    <section id="security" className="relative bg-ink text-cream border-y border-cream/8 overflow-hidden">
      <div className="absolute inset-0 dots-dark opacity-50" aria-hidden />
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-20">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
          <div>
            <SectionHead
              kicker="Security & privacy"
              title={[<>Your trips are yours.</>]}
              copy="Trip data is personal — who you traveled with, what you spent, where you went. You control who sees it, and you can export or delete your data anytime."
            />
            <Reveal delay={220}>
              <div className="mt-7 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/5 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-cream/70">
                  <IconDownload size={14} className="text-sea" /> Data export
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/5 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-cream/70">
                  <IconShield size={14} className="text-sea" /> No ads, no data selling
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/5 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-cream/70">
                  <IconLock size={14} className="text-sea" /> 33 secured endpoints
                </span>
              </div>
            </Reveal>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {TRUST.map((t, i) => (
              <Reveal key={t.title} delay={i * 100} className={i === 4 ? "sm:col-span-2" : ""}>
                <div className="group h-full flex items-start gap-4 rounded-2xl border border-cream/10 bg-ink2/70 p-5 transition-all duration-300 hover:border-sea/45 hover:-translate-y-1">
                  <span className="grid place-items-center h-11 w-11 rounded-xl bg-sea/12 text-sea border border-sea/25 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 shrink-0">
                    {t.icon}
                  </span>
                  <span>
                    <span className="block font-display font-bold text-[1.02rem] text-paper">{t.title}</span>
                    <span className="block mt-1 text-[0.85rem] text-cream/60 leading-relaxed">{t.copy}</span>
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal delay={250}>
          <p className="mt-10 text-center font-display font-bold text-[1.15rem] text-cream/80">
            <CountUp to={100} suffix="%" className="text-sea" /> of your trip data belongs to <span className="text-paper">you</span> — not us, not advertisers.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
