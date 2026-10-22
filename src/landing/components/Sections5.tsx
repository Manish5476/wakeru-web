'use client';
import { useState } from "react";
import { SectionHead, Reveal, CountUp, inr, Avatar, MaskLines, BtnLink } from "../lib/ui";
import { IconArrow, IconTrophy, IconSpark, IconMedal, IconPin, IconCompass } from "../lib/icons";
import { IMG } from "../lib/images";

/* ================= INSIGHTS ================= */
const MONTHS = [
  { m: "Jul", v: 38 }, { m: "Aug", v: 62 }, { m: "Sep", v: 24 }, { m: "Oct", v: 46 },
  { m: "Nov", v: 58 }, { m: "Dec", v: 92 }, { m: "Jan", v: 40 }, { m: "Feb", v: 30 },
];

export function Insights() {
  const [hover, setHover] = useState(5);

  return (
    <section id="insights" className="relative bg-cream text-ink noise overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 lg:py-32">
        <SectionHead
          dark={false}
          kicker="Travel insights"
          title={[<>Your trips tell a story.</>, <>Your spending does too.</>]}
          copy="After every trip, TripSplit turns raw expenses into patterns you'll actually use on the next adventure."
        />

        <div className="mt-14 grid lg:grid-cols-[1.05fr_0.95fr] gap-6">
          {/* callout + stats */}
          <div className="space-y-4">
            <Reveal>
              <div className="rounded-[1.5rem] bg-ink text-cream p-6 sm:p-8 shadow-card relative overflow-hidden">
                <span className="absolute -right-8 -top-8 text-[7rem] leading-none opacity-10 rotate-12">🍜</span>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-sun">Smart comparison vs. last trip</p>
                <p className="mt-3 font-display font-bold text-[clamp(1.4rem,2.6vw,1.9rem)] leading-snug text-paper">
                  You spent <span className="text-coral2"><CountUp to={14420} prefix="₹" /></span> more on food than your last trip.
                </p>
                <p className="mt-2 text-[0.9rem] text-cream/65">Mostly beach shacks. Worth it — 4.9★ average dinner rating from your crew.</p>
              </div>
            </Reveal>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { k: "Average trip expense", v: <CountUp to={12840} prefix="₹" />, note: "across your last 6 trips", icon: "💸" },
                { k: "Most expensive category", v: "Accommodation", note: "42% of total spend", icon: "🏨" },
                { k: "Favorite destination", v: "Goa", note: "3 trips and counting", icon: "🌴" },
                { k: "Most active month", v: "December", note: "₹48,200 across 2 trips", icon: "🎄" },
              ].map((s, i) => (
                <Reveal key={s.k} delay={i * 110}>
                  <div className="h-full rounded-2xl bg-paper border border-ink/10 p-5 shadow-lift transition-all duration-300 hover:-translate-y-1 hover:border-coral/50">
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink/45">{s.k}</p>
                      <span className="text-lg">{s.icon}</span>
                    </div>
                    <p className="mt-2 font-display font-bold text-[1.55rem] tracking-tight">{s.v}</p>
                    <p className="text-[0.78rem] text-ink/55 mt-1">{s.note}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* chart */}
          <Reveal delay={160}>
            <div className="h-full rounded-[1.5rem] bg-paper border border-ink/10 p-6 sm:p-7 shadow-lift flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-[1.15rem]">Spend by month</h3>
                <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink/45">last 8 months</span>
              </div>
              <div className="mt-6 flex-1 flex items-end gap-2.5 sm:gap-3.5 min-h-[240px]">
                {MONTHS.map((mo, i) => (
                  <button
                    key={mo.m}
                    onMouseEnter={() => setHover(i)}
                    onFocus={() => setHover(i)}
                    onClick={() => setHover(i)}
                    className="group relative flex-1 flex flex-col items-center justify-end h-full"
                    aria-label={`${mo.m}: ₹${(mo.v * 520).toLocaleString("en-IN")}`}
                  >
                    <span className={`pointer-events-none absolute -top-1 transition-all duration-300 rounded-lg px-2.5 py-1 font-mono text-[10px] whitespace-nowrap shadow-lift ${hover === i ? "opacity-100 bg-ink text-paper -translate-y-1" : "opacity-0"}`}>
                      {inr(mo.v * 520)}
                    </span>
                    <span
                      className={`anim-grow w-full max-w-[44px] rounded-t-xl transition-colors duration-300 ${i === 5 ? "bg-coral" : "bg-ink/12 group-hover:bg-ink/25"}`}
                      style={{ height: `${mo.v * 2.1}px`, animationDelay: `${i * 70}ms` }}
                    />
                    <span className={`mt-2.5 font-mono text-[10.5px] ${hover === i ? "text-coral font-semibold" : "text-ink/45"}`}>{mo.m}</span>
                  </button>
                ))}
              </div>
              <p className="mt-4 rounded-xl bg-coral/8 border border-coral/25 px-4 py-3 text-[0.85rem] text-ink/75">
                <strong className="text-coral">December spike:</strong> Goa Getaway + a spontaneous Manali weekend. No regrets recorded.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================= ACHIEVEMENTS + LEADERBOARD ================= */
const ACH = [
  { icon: "🏆", name: "Weekend Wanderer", desc: "Completed 5 trips", prog: "5/5", unlocked: true },
  { icon: "🌍", name: "Globe Trotter", desc: "Visited 10 destinations", prog: "10/10", unlocked: true },
  { icon: "💸", name: "Budget Master", desc: "Stayed under budget 3 times", prog: "3/3", unlocked: false },
  { icon: "🤝", name: "Travel Crew", desc: "Traveled with 10 friends", prog: "8/10", unlocked: false },
  { icon: "🔥", name: "Travel Streak", desc: "3 trips this year", prog: "2/3", unlocked: false },
];

export function Achievements() {
  const [state, setState] = useState(ACH.map((a) => a.unlocked));

  return (
    <section id="achievements" className="relative bg-ink text-cream noise overflow-hidden">
      <div className="absolute inset-0 topo" aria-hidden />
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 lg:py-32">
        <SectionHead
          kicker="Gamification"
          title={[<>Turn every trip</>, <>into an <span className="text-coral2">achievement.</span></>]}
          copy="Milestones, streaks and leaderboards make the practical parts of travel genuinely fun. Tap the locked ones ↓"
        />

        <div className="mt-14 grid lg:grid-cols-[1.25fr_0.75fr] gap-6 items-start">
          <div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {ACH.map((a, i) => {
                const on = state[i];
                const [cur, max] = a.prog.split("/").map(Number);
                const ready = cur === max;
                return (
                  <Reveal key={a.name} delay={i * 90}>
                    <button
                      onClick={() => ready && !on && setState(state.map((s, k) => (k === i ? true : s)))}
                      disabled={!ready && !on}
                      className={`relative w-full text-left rounded-[1.3rem] border p-5 transition-all duration-500 overflow-hidden h-full ${
                        on
                          ? "border-sun/45 bg-gradient-to-b from-ink3 to-ink2 shadow-[0_18px_44px_-18px_rgb(255_179_80/0.35)]"
                          : ready
                          ? "border-dashed border-coral/50 bg-ink2/70 hover:-translate-y-1 cursor-pointer"
                          : "border-cream/8 bg-ink2/50 opacity-70"
                      }`}
                    >
                      {on && (
                        <span className="stamp absolute right-3 top-3 text-sun text-[8.5px] px-2.5 py-1.5 uppercase anim-pop">Unlocked</span>
                      )}
                      <span className={`grid place-items-center h-13 w-13 rounded-2xl text-[1.55rem] ${on ? "bg-sun/15" : "bg-cream/5 grayscale"}`} style={{ height: 52, width: 52 }}>
                        {a.icon}
                      </span>
                      <h3 className={`mt-3.5 font-display font-bold text-[1.05rem] ${on ? "text-paper" : "text-cream/75"}`}>{a.name}</h3>
                      <p className="text-[0.78rem] text-cream/55 mt-1">{a.desc}</p>
                      <div className="mt-3.5 flex items-center gap-2.5">
                        <div className="h-1.5 flex-1 rounded-full bg-ink overflow-hidden border border-cream/10">
                          <div className={`h-full rounded-full ${on ? "bg-sun" : "bg-coral/70"}`} style={{ width: `${(cur / max) * 100}%` }} />
                        </div>
                        <span className="font-mono text-[10.5px] text-cream/55 tabular-nums">{a.prog}</span>
                      </div>
                      {!on && ready && (
                        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-coral2 flex items-center gap-1.5">
                          <IconSpark size={11} /> Tap to claim
                        </p>
                      )}
                    </button>
                  </Reveal>
                );
              })}
              {/* teaser tile */}
              <Reveal delay={480}>
                <div className="rounded-[1.3rem] border border-dashed border-cream/20 p-5 grid place-items-center text-center min-h-[180px]">
                  <div>
                    <IconTrophy size={26} className="mx-auto text-cream/40" />
                    <p className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-cream/45">+ 19 more achievements</p>
                    <p className="text-[0.78rem] text-cream/35 mt-1">hidden in the wild</p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* leaderboard */}
          <Reveal delay={200}>
            <div className="rounded-[1.5rem] border border-cream/10 bg-ink2/85 p-6 sm:p-7">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-[1.2rem] text-paper">Trip leaderboard</h3>
                <span className="font-mono text-[10px] uppercase tracking-wider text-cream/45">2026 season</span>
              </div>
              <ul className="mt-6 space-y-3">
                {[
                  { name: "Nehal", pts: 2840, trips: 7, tone: "#FFB350" },
                  { name: "Rahul", pts: 2615, trips: 6, tone: "#C9D4E0" },
                  { name: "Sarah", pts: 2210, trips: 6, tone: "#D08A5A" },
                  { name: "Arjun", pts: 1980, trips: 5, tone: "#31486a" },
                ].map((p, i) => (
                  <li key={p.name} className="anim-pop flex items-center gap-3.5 rounded-xl bg-ink border border-cream/8 px-4 py-3 transition-all duration-300 hover:border-cream/25 hover:translate-x-1" style={{ animationDelay: `${i * 120}ms` }}>
                    <IconMedal size={26} tone={p.tone} />
                    <Avatar name={p.name} size={34} />
                    <span className="flex-1">
                      <span className="block font-semibold text-[0.95rem]">{p.name}</span>
                      <span className="block font-mono text-[10px] uppercase tracking-wider text-cream/45">{p.trips} trips · {i === 0 ? "on a streak 🔥" : "climbing"}</span>
                    </span>
                    <span className="font-display font-bold tabular-nums text-sun">{p.pts.toLocaleString("en-IN")} pts</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[0.8rem] text-cream/50 leading-relaxed">
                Points come from trips completed, budgets honored, settlements made on time — and photos shared. Yes, really.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================= TRIP STORY ================= */
const STORY = [
  { day: "Day 1", img: IMG.storyBeach, cap: "Sunrise boats at Baga", emoji: "🌅" },
  { day: "Day 2", img: IMG.storyFood, cap: "The ₹4,820 feast", emoji: "🍛" },
  { day: "Day 3", img: IMG.storyScooter, cap: "Scooters to Anjuna", emoji: "🛵" },
  { day: "Day 4", img: IMG.storySunset, cap: "Last sunset, loud cheers", emoji: "🌊" },
];

export function Story() {
  return (
    <section id="story" className="relative bg-cream text-ink noise overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 pt-24 lg:pt-32 pb-10">
        <SectionHead
          dark={false}
          kicker="Trip stories"
          title={[<>Don't just finish the trip.</>, <>Remember it.</>]}
          copy="When a trip ends, TripSplit wraps it into a story — the stats, the stops, the moments — ready to rewatch with the crew."
        />

        <Reveal delay={150}>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
            <p className="font-display font-bold text-[2.2rem] tracking-tight flex items-center gap-3">
              <IconPin size={26} className="text-coral" /> Goa
            </p>
            {[
              ["5", "Days"], ["4", "Friends"], ["₹48,620", "Spent"], ["27", "Expenses"], ["12", "Places"],
            ].map(([v, k]) => (
              <p key={k} className="flex items-baseline gap-2">
                <span className="font-display font-bold text-[1.45rem] tabular-nums text-coral">{v}</span>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink/50">{k}</span>
              </p>
            ))}
          </div>
        </Reveal>
      </div>

      {/* filmstrip */}
      <div className="relative z-10 mt-8 pb-24 lg:pb-32">
        <div className="flex gap-5 overflow-x-auto scrollbar-none px-5 sm:px-8 lg:px-[max(1.25rem,calc((100vw-80rem)/2+2rem))] snap-x snap-mandatory">
          {STORY.map((s, i) => (
            <Reveal key={s.day} delay={i * 110} className="snap-center shrink-0">
              <figure className="group relative w-[240px] sm:w-[280px] rounded-2xl overflow-hidden shadow-card rotate-(--rot) transition-all duration-500 hover:rotate-0 hover:-translate-y-2" style={{ ["--rot" as string]: i % 2 ? "1.2deg" : "-1.2deg" }}>
                <img src={s.img} alt={s.cap} loading="lazy" className="h-[300px] sm:h-[340px] w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent" />
                <figcaption className="absolute bottom-0 inset-x-0 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-sun">{s.day} {s.emoji}</p>
                  <p className="font-display font-bold text-paper text-[1.02rem] mt-1">{s.cap}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
          {/* receipt tile */}
          <Reveal delay={460} className="snap-center shrink-0">
            <div className="w-[240px] sm:w-[280px] h-[300px] sm:h-[340px] rounded-2xl bg-ink text-cream p-6 shadow-card rotate-[1.4deg] transition-all duration-500 hover:rotate-0 hover:-translate-y-2 flex flex-col">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-coral2">Day 5 · The wrap-up</p>
              <p className="mt-3 font-display font-bold text-[1.35rem] leading-snug text-paper">Everyone settled. Zero drama.</p>
              <div className="mt-auto space-y-2 font-mono text-[11.5px] text-cream/70">
                <p className="flex justify-between"><span>3 payments</span><span className="text-sea">✓ done</span></p>
                <p className="flex justify-between"><span>27 expenses</span><span className="text-sea">✓ logged</span></p>
                <p className="flex justify-between"><span>1 story</span><span className="text-sun">✓ wrapped</span></p>
              </div>
              <span className="stamp mt-5 text-sea text-[9px] px-3 py-2 uppercase w-fit">Trip complete</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================= YEAR IN REVIEW ================= */
const YEAR_STATS: { v: number; prefix?: string; label: string; icon: string }[] = [
  { v: 7, label: "Trips", icon: "🧳" },
  { v: 14, label: "Cities", icon: "🏙️" },
  { v: 38, label: "Friends", icon: "🤝" },
  { v: 184620, prefix: "₹", label: "Spent", icon: "💸" },
  { v: 92, label: "Expenses", icon: "🧾" },
  { v: 12, label: "Achievements", icon: "🏆" },
  { v: 3, label: "New countries", icon: "🌍" },
];

export function YearReview() {
  return (
    <section id="year" className="relative bg-ink text-cream noise overflow-hidden">
      {/* starfield dots */}
      <div className="absolute inset-0 dots-dark opacity-60" aria-hidden />
      <div className="absolute top-10 left-1/4 h-64 w-64 rounded-full bg-coral/10 blur-3xl" aria-hidden />
      <div className="absolute bottom-10 right-1/5 h-72 w-72 rounded-full bg-sun/8 blur-3xl" aria-hidden />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 lg:py-32 text-center">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-coral2 flex items-center justify-center gap-3">
            <IconCompass size={15} /> Year in review
          </p>
        </Reveal>
        <MaskLines
          as="h2"
          className="font-display font-bold tracking-tight text-paper mt-5 text-[clamp(2.4rem,6vw,4.4rem)] leading-[1.02]"
          lines={[<>See the year you traveled.</>]}
        />

        <Reveal delay={150}>
          <p className="mt-6 inline-block font-display font-bold text-[clamp(3.4rem,9vw,6.5rem)] tracking-tight text-paper leading-none">
            2026<span className="text-coral">.</span>
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5 max-w-6xl mx-auto">
          {YEAR_STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 90}>
              <div className="group h-full rounded-2xl border border-cream/10 bg-ink2/70 px-4 py-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-sun/50 hover:shadow-[0_18px_44px_-18px_rgb(255_179_80/0.35)]">
                <span className="text-[1.5rem] inline-block transition-transform duration-500 group-hover:scale-125 group-hover:-rotate-6">{s.icon}</span>
                <p className="mt-2.5 font-display font-bold text-[1.55rem] text-paper tabular-nums leading-tight">
                  <CountUp to={s.v} prefix={s.prefix ?? ""} duration={1700} />
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cream/50 mt-1">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={300}>
          <div className="mt-12 flex justify-center">
            <BtnLink href="#get-started" variant="primary">
              Create Your Travel Year
              <IconArrow size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </BtnLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
