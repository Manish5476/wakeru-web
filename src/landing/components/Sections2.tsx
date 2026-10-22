'use client';
import { useMemo, useState } from "react";
import { SectionHead, Reveal, Avatar, inr } from "../lib/ui";
import { IconPin, IconCalendar, IconArrow, IconCheck, IconCross, IconPlane } from "../lib/icons";

/* ================= TRIP PLANNER ================= */
type Day = { label: string; city: string; emoji: string; stops: { icon: string; title: string; detail: string }[] };
type Trip = { id: string; name: string; route: string; days: Day[]; segment: { icon: string; label: string }[]; budget: string; progress: number };

const TRIPS: Trip[] = [
  {
    id: "europe",
    name: "Europe Adventure",
    route: "London → Paris → Amsterdam → Zurich",
    budget: "₹2,40,000",
    progress: 64,
    segment: [
      { icon: "✈️", label: "LHR → CDG · 1h 15m" },
      { icon: "🚆", label: "Paris → Amsterdam · Thalys 3h 20m" },
    ],
    days: [
      {
        label: "Day 01", city: "London", emoji: "🇬🇧",
        stops: [
          { icon: "🏨", title: "Hotel — The Zetter", detail: "Check-in 3:00 PM · Booking #ZH-8841" },
          { icon: "🍽️", title: "Dinner — Borough Market", detail: "Reserved 8:00 PM · table for 6" },
          { icon: "📍", title: "Big Ben & Westminster", detail: "Golden hour walk · free" },
        ],
      },
      {
        label: "Day 03", city: "Paris", emoji: "🇫🇷",
        stops: [
          { icon: "🚆", title: "Eurostar to Paris", detail: "Departs 9:31 AM · Coach 12" },
          { icon: "🏨", title: "Hotel — Le Marais Loft", detail: "2 nights · paid ₹28,400" },
          { icon: "🗼", title: "Eiffel Tower", detail: "Summit tickets · 6:45 PM slot" },
        ],
      },
      {
        label: "Day 06", city: "Amsterdam", emoji: "🇳🇱",
        stops: [
          { icon: "🚲", title: "City Tour by Bike", detail: "6 bikes reserved · Jordaan loop" },
          { icon: "🌷", title: "Bloemenmarkt", detail: "Tulip bulbs for home 🌷" },
        ],
      },
    ],
  },
  {
    id: "goa",
    name: "Goa Getaway",
    route: "Goa Airport → Panjim → Baga → Anjuna → Old Goa",
    budget: "₹60,000",
    progress: 100,
    segment: [
      { icon: "🛺", label: "Airport → Panjim · 45 min" },
      { icon: "🛵", label: "Scooters all week · ₹350/day" },
    ],
    days: [
      {
        label: "Day 01", city: "Panjim", emoji: "🌴",
        stops: [
          { icon: "🏨", title: "Heritage Stay — Fontainhas", detail: "Check-in · paid by Nehal" },
          { icon: "🍛", title: "Lunch — Ritz Classic", detail: "Fish thali · ₹1,840" },
        ],
      },
      {
        label: "Day 02", city: "Baga Beach", emoji: "🏖️",
        stops: [
          { icon: "🏄", title: "Water sports", detail: "Parasailing + jet ski · ₹7,200" },
          { icon: "🍷", title: "Shack dinner", detail: "Sunset table · split 5 ways" },
        ],
      },
      {
        label: "Day 04", city: "Old Goa", emoji: "⛪",
        stops: [
          { icon: "📍", title: "Basilica of Bom Jesus", detail: "Morning visit · free" },
          { icon: "🍜", title: "Café Bodega", detail: "Bebinca + chai · ₹640" },
        ],
      },
    ],
  },
];

export function Planner() {
  const [ti, setTi] = useState(0);
  const [openDay, setOpenDay] = useState(0);
  const t = TRIPS[ti];

  return (
    <section id="planner" className="relative bg-cream text-ink noise overflow-hidden">
      <div className="absolute inset-0 dots-light opacity-50" aria-hidden />
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-start">
          <div className="lg:sticky lg:top-28">
            <SectionHead
              dark={false}
              kicker="Trip planner"
              title={[<>Plan the journey</>, <>before the journey begins.</>]}
              copy="Destinations, stops, dates, travel segments and bookings — laid out on one beautiful timeline your whole crew can see."
            />
            <Reveal delay={200}>
              <div className="mt-8 flex flex-wrap gap-2.5">
                {TRIPS.map((trip, i) => (
                  <button
                    key={trip.id}
                    onClick={() => { setTi(i); setOpenDay(0); }}
                    className={`rounded-full px-5 py-2.5 text-[0.88rem] font-bold transition-all duration-300 ${
                      i === ti ? "bg-ink text-paper shadow-lift -translate-y-0.5" : "bg-paper border border-ink/12 text-ink/65 hover:border-ink/40"
                    }`}
                  >
                    {trip.name}
                  </button>
                ))}
              </div>
            </Reveal>
            <Reveal delay={280}>
              <div className="mt-6 rounded-2xl bg-paper border border-ink/10 p-5 shadow-lift">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/45">Route</p>
                <p className="mt-1.5 font-display font-bold text-[1.05rem] leading-snug">{t.route}</p>
                <div className="mt-4 flex items-center justify-between font-mono text-[11px] text-ink/55">
                  <span className="flex items-center gap-1.5"><IconCalendar size={13} className="text-coral" /> Budget {t.budget}</span>
                  <span className="text-sea font-semibold">{t.progress}% planned</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-cream2 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-sea to-sky2 transition-[width] duration-1000 ease-out" style={{ width: `${t.progress}%` }} />
                </div>
              </div>
            </Reveal>
          </div>

          {/* itinerary timeline */}
          <div className="relative">
            <div className="absolute left-[26px] top-4 bottom-8 w-px border-l-2 border-dashed border-coral/40" aria-hidden />
            <div className="space-y-5">
              {t.days.map((day, di) => (
                <Reveal key={t.id + day.label} delay={di * 130}>
                  <div className="relative pl-16">
                    <span className="absolute left-[17px] top-7 grid place-items-center h-5 w-5 rounded-full bg-coral ring-4 ring-cream">
                      <span className="h-1.5 w-1.5 rounded-full bg-paper" />
                    </span>
                    <button
                      onClick={() => setOpenDay(openDay === di ? -1 : di)}
                      aria-expanded={openDay === di}
                      className="w-full text-left rounded-2xl bg-paper border border-ink/10 shadow-lift p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-coral/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-coral bg-coral/10 rounded-full px-3 py-1">{day.label}</span>
                        <span className="text-lg">{day.emoji}</span>
                        <h3 className="font-display font-bold text-[1.25rem] tracking-tight">{day.city}</h3>
                        <span className={`ml-auto text-ink/40 transition-transform duration-300 ${openDay === di ? "rotate-90" : ""}`}>
                          <IconArrow size={16} />
                        </span>
                      </div>
                      <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${openDay === di ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"}`}>
                        <ul className="overflow-hidden space-y-2.5">
                          {day.stops.map((s) => (
                            <li key={s.title} className="flex items-center gap-3 rounded-xl bg-cream px-3.5 py-2.5 border border-ink/6 transition-colors hover:border-coral/40">
                              <span className="text-lg">{s.icon}</span>
                              <span>
                                <span className="block text-[0.9rem] font-semibold leading-tight">{s.title}</span>
                                <span className="block text-[0.75rem] text-ink/55 font-mono mt-0.5">{s.detail}</span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </button>
                    {di < t.days.length - 1 && (
                      <div className="mt-4 ml-2 inline-flex items-center gap-2 rounded-full bg-ink text-cream px-4 py-2 font-mono text-[11px] tracking-wide shadow-lift">
                        <span>{t.segment[di]?.icon}</span> {t.segment[di]?.label}
                      </div>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= EXPENSE SPLITTER ================= */
const PEOPLE = ["Rahul", "Sarah", "Arjun", "Nehal", "Priya"];

export function Splitter() {
  const [amount, setAmount] = useState(4800);
  const [payer, setPayer] = useState("Nehal");
  const [inSplit, setInSplit] = useState<boolean[]>([true, true, true, true, false]);
  const [mode, setMode] = useState<"equal" | "custom">("equal");
  const [weights, setWeights] = useState([3, 3, 3, 3, 2]);

  const participants = PEOPLE.filter((_, i) => inSplit[i]);

  const shares = useMemo(() => {
    const idxs = PEOPLE.map((_, i) => i).filter((i) => inSplit[i]);
    if (idxs.length === 0) return {};
    const out: Record<string, number> = {};
    if (mode === "equal") {
      const base = Math.floor(amount / idxs.length);
      idxs.forEach((i, k) => (out[PEOPLE[i]] = base + (k < amount - base * idxs.length ? 1 : 0)));
    } else {
      const totalW = idxs.reduce((s, i) => s + weights[i], 0) || 1;
      let used = 0;
      idxs.forEach((i, k) => {
        if (k === idxs.length - 1) out[PEOPLE[i]] = amount - used;
        else {
          const v = Math.round((amount * weights[i]) / totalW);
          out[PEOPLE[i]] = v;
          used += v;
        }
      });
    }
    return out;
  }, [amount, inSplit, mode, weights]);

  const total = Object.values(shares).reduce((s, v) => s + v, 0);

  return (
    <section id="split" className="relative bg-ink text-cream noise overflow-hidden">
      <div className="absolute inset-0 topo" aria-hidden />
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 lg:py-32">
        <SectionHead
          kicker="Expense splitting"
          title={[<>Stop calculating.</>, <><span className="text-coral2">Start enjoying.</span></>]}
          copy="Add an expense, pick who paid, choose who's in — TripSplit handles the math automatically. Try it yourself ↓"
        />

        <div className="mt-14 grid lg:grid-cols-2 gap-6 items-stretch">
          {/* input panel */}
          <Reveal>
            <div className="h-full rounded-[1.5rem] border border-cream/10 bg-ink2/85 p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-[1.3rem] text-paper">🍜 Dinner · Beach Shack</h3>
                <span className="stamp text-sun text-[9px] px-3 py-2 uppercase">Editable</span>
              </div>

              {/* amount */}
              <label className="block mt-6">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream/50">Amount</span>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center rounded-xl bg-ink border border-cream/12 focus-within:border-coral/60 transition-colors px-4">
                    <span className="text-coral2 font-bold text-lg">₹</span>
                    <input
                      type="number"
                      min={100}
                      max={999999}
                      value={amount}
                      onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                      className="bg-transparent w-28 px-2 py-3 font-display font-bold text-[1.35rem] text-paper outline-none tabular-nums"
                      aria-label="Expense amount"
                    />
                  </div>
                  <input
                    type="range"
                    min={500}
                    max={20000}
                    step={50}
                    value={Math.min(20000, amount)}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="split-range flex-1"
                    aria-label="Expense amount slider"
                  />
                </div>
              </label>

              {/* paid by */}
              <div className="mt-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream/50">Paid by</p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {PEOPLE.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPayer(p)}
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.82rem] font-semibold transition-all duration-300 ${
                        payer === p ? "bg-coral text-paper shadow-[0_8px_20px_-8px_rgb(255_90_54/0.8)]" : "bg-ink border border-cream/12 text-cream/65 hover:border-cream/40"
                      }`}
                    >
                      <Avatar name={p} size={20} /> {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* split between */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream/50">Split between</p>
                  <div className="flex rounded-full bg-ink border border-cream/12 p-1">
                    {(["equal", "custom"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`px-3.5 py-1 rounded-full text-[0.75rem] font-bold uppercase tracking-wider transition-all duration-300 ${
                          mode === m ? "bg-paper text-ink" : "text-cream/55 hover:text-cream"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  {PEOPLE.map((p, i) => (
                    <div key={p} className={`rounded-xl border px-4 py-2.5 transition-all duration-300 ${inSplit[i] ? "border-cream/15 bg-ink/70" : "border-cream/6 bg-transparent opacity-45"}`}>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            const next = [...inSplit];
                            next[i] = !next[i];
                            if (next.some(Boolean)) setInSplit(next);
                          }}
                          role="switch"
                          aria-checked={inSplit[i]}
                          aria-label={`Include ${p} in split`}
                          className={`h-6 w-6 rounded-md grid place-items-center transition-all duration-300 ${inSplit[i] ? "bg-sea text-ink" : "bg-ink border border-cream/25 text-transparent"}`}
                        >
                          <IconCheck size={13} />
                        </button>
                        <Avatar name={p} size={26} />
                        <span className="text-[0.9rem] font-medium">{p}</span>
                        {mode === "custom" && inSplit[i] && (
                          <span className="ml-auto flex items-center gap-2">
                            <input
                              type="range"
                              min={1}
                              max={10}
                              value={weights[i]}
                              onChange={(e) => {
                                const w = [...weights];
                                w[i] = Number(e.target.value);
                                setWeights(w);
                              }}
                              className="split-range w-24"
                              aria-label={`${p} share weight`}
                            />
                            <span className="font-mono text-[11px] text-cream/50 w-7 text-right">w{weights[i]}</span>
                          </span>
                        )}
                        {mode === "equal" && inSplit[i] && (
                          <span className="ml-auto font-mono text-[11px] text-cream/45">1/{participants.length}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {mode === "custom" && (
                  <button
                    onClick={() => setWeights([4, 2, 5, 1, 3])}
                    className="mt-3 text-[0.78rem] font-mono text-coral2 hover:text-coral underline underline-offset-4 transition-colors"
                  >
                    ↳ Try the brief's uneven split
                  </button>
                )}
              </div>
            </div>
          </Reveal>

          {/* result panel */}
          <Reveal delay={140}>
            <div className="h-full rounded-[1.5rem] border border-coral/25 bg-gradient-to-b from-ink3 to-ink2 p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute -top-16 -right-16 h-52 w-52 rounded-full bg-coral/12 blur-3xl" aria-hidden />
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream/50">Everyone's share · updates live</p>
              <h3 className="mt-2 font-display font-bold text-[1.5rem] text-paper">
                {inr(amount)} <span className="text-cream/50 text-[1rem] font-body font-medium">paid by {payer}</span>
              </h3>

              <ul className="mt-7 space-y-4">
                {PEOPLE.map((p, i) =>
                  inSplit[i] ? (
                    <li key={p + mode} className="anim-pop">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-3">
                          <Avatar name={p} size={32} />
                          <span className="font-semibold text-[0.95rem]">{p}</span>
                          {p === payer && <span className="rounded-full bg-sun/15 border border-sun/30 text-sun px-2 py-0.5 text-[0.65rem] font-mono uppercase tracking-wider">paid</span>}
                        </span>
                        <span className="font-display font-bold text-[1.25rem] text-paper tabular-nums">{inr(shares[p] ?? 0)}</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-ink overflow-hidden border border-cream/8">
                        <div
                          className="h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                          style={{
                            width: `${amount ? ((shares[p] ?? 0) / amount) * 100 : 0}%`,
                            background: p === payer ? "linear-gradient(90deg,#FFB350,#FF5A36)" : "linear-gradient(90deg,#35C98E,#6AB9E9)",
                          }}
                        />
                      </div>
                    </li>
                  ) : (
                    <li key={p} className="flex items-center gap-3 opacity-35">
                      <Avatar name={p} size={32} />
                      <span className="text-[0.9rem] text-cream/60">{p}</span>
                      <span className="ml-auto font-mono text-[11px] uppercase tracking-wider text-cream/40">not in this split</span>
                    </li>
                  )
                )}
              </ul>

              <div className="mt-7 flex items-center justify-between rounded-xl bg-ink/70 border border-cream/10 px-4 py-3">
                <span className="font-mono text-[11px] uppercase tracking-widest text-cream/55">Total split</span>
                <span className={`font-mono text-[0.9rem] font-semibold tabular-nums flex items-center gap-2 ${total === amount ? "text-sea" : "text-coral2"}`}>
                  {total === amount ? <IconCheck size={14} /> : <IconCross size={14} />} {inr(total)} / {inr(amount)}
                </span>
              </div>
              <p className="mt-5 text-center font-display font-bold text-paper text-[1.05rem]">
                TripSplit handles the math <span className="text-coral2">automatically.</span>
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================= EXPENSE TIMELINE ================= */
type Txn = { time: string; icon: string; title: string; amt: number; by: string; cat: string; day: string };
const TXNS: Txn[] = [
  { time: "08:42 AM", icon: "☕", title: "Coffee", amt: 420, by: "Sarah", cat: "Food", day: "Day 3 · Wed, Aug 19" },
  { time: "12:30 PM", icon: "🍜", title: "Lunch", amt: 2840, by: "Rahul", cat: "Food", day: "Day 3 · Wed, Aug 19" },
  { time: "04:15 PM", icon: "🚕", title: "Taxi", amt: 1200, by: "Nehal", cat: "Transport", day: "Day 3 · Wed, Aug 19" },
  { time: "08:30 PM", icon: "🍷", title: "Dinner", amt: 5420, by: "Arjun", cat: "Food", day: "Day 3 · Wed, Aug 19" },
  { time: "09:10 AM", icon: "🏄", title: "Surf lesson", amt: 3600, by: "Rahul", cat: "Fun", day: "Day 4 · Thu, Aug 20" },
  { time: "01:45 PM", icon: "🏨", title: "Hotel night 4", amt: 9000, by: "Arjun", cat: "Stay", day: "Day 4 · Thu, Aug 20" },
  { time: "06:20 PM", icon: "🛵", title: "Scooter fuel", amt: 350, by: "Sarah", cat: "Transport", day: "Day 4 · Thu, Aug 20" },
];
const CATS = ["All", "Food", "Transport", "Stay", "Fun"];

export function Timeline() {
  const [cat, setCat] = useState("All");
  const list = TXNS.filter((t) => cat === "All" || t.cat === cat);
  let lastDay = "";

  return (
    <section id="timeline" className="relative bg-cream text-ink noise overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12">
          <div className="lg:sticky lg:top-28 self-start">
            <SectionHead
              dark={false}
              kicker="Expense timeline"
              title={[<>Every rupee,</>, <>in the order it happened.</>]}
              copy="Expenses land on a live timeline as your crew adds them — coffee at 8:42, dinner at 8:30. Nothing gets lost between screenshots."
            />
            <Reveal delay={220}>
              <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
                {CATS.map((c) => (
                  <button
                    key={c}
                    role="tab"
                    aria-selected={cat === c}
                    onClick={() => setCat(c)}
                    className={`rounded-full px-4 py-2 text-[0.84rem] font-bold transition-all duration-300 ${
                      cat === c ? "bg-ink text-paper shadow-lift -translate-y-0.5" : "bg-paper border border-ink/12 text-ink/60 hover:border-ink/40"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </Reveal>
            <Reveal delay={300}>
              <div className="mt-8 rounded-2xl bg-ink text-cream p-5 shadow-card rotate-[-1.2deg] transition-transform duration-500 hover:rotate-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream/50">Live total · {cat === "All" ? "all categories" : cat}</p>
                <p className="mt-1.5 font-display font-bold text-[2rem] text-paper tabular-nums">{inr(list.reduce((s, t) => s + t.amt, 0))}</p>
                <p className="font-mono text-[11px] text-cream/55">{list.length} expense{list.length === 1 ? "" : "s"} on the timeline</p>
              </div>
            </Reveal>
          </div>

          <div className="relative">
            <div className="absolute left-[7px] top-3 bottom-3 w-px bg-ink/15 border-l border-dashed border-ink/25" aria-hidden />
            <ul className="space-y-4">
              {list.map((t, i) => {
                const showDay = t.day !== lastDay;
                lastDay = t.day;
                return (
                  <li key={cat + t.time + t.title}>
                    {showDay && (
                      <p className="mb-3 ml-8 font-mono text-[10px] uppercase tracking-[0.22em] text-coral">{t.day}</p>
                    )}
                    <div className="anim-pop relative flex items-center gap-4 pl-8" style={{ animationDelay: `${i * 70}ms` }}>
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[15px] w-[15px] rounded-full bg-paper border-[3px] border-coral" />
                      <span className="font-mono text-[11px] text-ink/50 w-[72px] shrink-0 tabular-nums">{t.time}</span>
                      <div className="flex-1 flex items-center gap-3.5 rounded-2xl bg-paper border border-ink/8 shadow-lift px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-coral/45">
                        <span className="grid place-items-center h-11 w-11 rounded-xl bg-cream text-[1.25rem]">{t.icon}</span>
                        <span className="flex-1">
                          <span className="block font-semibold text-[0.95rem] leading-tight">{t.title}</span>
                          <span className="flex items-center gap-2 text-[0.75rem] text-ink/55 mt-0.5">
                            <Avatar name={t.by} size={16} /> Paid by {t.by} · {t.cat}
                          </span>
                        </span>
                        <span className="font-display font-bold text-[1.1rem] tabular-nums">{inr(t.amt)}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            {list.length === 0 && (
              <p className="ml-8 text-ink/50 font-mono text-sm">No expenses in this category yet.</p>
            )}
          </div>
        </div>
        <p className="mt-10 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-ink/40 flex items-center justify-center gap-2">
          <IconPlane size={14} className="text-coral" /> Every expense timestamped, categorized and attributed
        </p>
      </div>
    </section>
  );
}
