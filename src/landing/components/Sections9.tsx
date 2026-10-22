'use client';
import { useState, useMemo } from "react";
import { SectionHead, Reveal, CountUp, inr, Avatar, MaskLines, Kicker } from "../lib/ui";
import {
  IconCheck, IconArrow, IconCamera, IconReceipt, IconSpark, IconWallet,
  IconSplit, IconMap, IconPin, IconPlus, IconCross,
} from "../lib/icons";

/* ═══════════════════════════════════════════════════════════════
   AI RECEIPT OCR — 4-stage visual recognition
   ═══════════════════════════════════════════════════════════════ */

const OCR_STAGES = [
  { n: 1, label: "Contrast & Edge Detection", emoji: "🔍", duration: "0.8s" },
  { n: 2, label: "OCR Text Extraction", emoji: "📝", duration: "1.2s" },
  { n: 3, label: "Dish Name & Price Parsing", emoji: "🍽️", duration: "0.9s" },
  { n: 4, label: "Total & Tax Verification", emoji: "✓", duration: "0.6s" },
];

const LINE_ITEMS = [
  { name: "Butter Garlic Prawns", price: 680, assigned: ["Rahul", "Sarah"] },
  { name: "Goan Fish Curry", price: 420, assigned: ["Arjun"] },
  { name: "Chicken Xacuti", price: 380, assigned: ["Nehal", "Priya"] },
  { name: "Prawn Biryani", price: 520, assigned: ["Rahul"] },
  { name: "Sol Kadhi × 4", price: 320, assigned: ["Rahul", "Sarah", "Arjun", "Nehal", "Priya"] },
];

const CREW = ["Rahul", "Sarah", "Arjun", "Nehal", "Priya"];

export function AIReceipt() {
  const [stage, setStage] = useState(0);
  const [scanning, setScanning] = useState(false);

  const startScan = () => {
    setScanning(true);
    setStage(0);
    OCR_STAGES.forEach((_, i) => {
      setTimeout(() => setStage(i + 1), 600 + i * 700);
    });
    setTimeout(() => setScanning(false), 600 + OCR_STAGES.length * 700 + 200);
  };

  const subtotal = LINE_ITEMS.reduce((s, l) => s + l.price, 0);
  const gst = Math.round(subtotal * 0.05);
  const tip = Math.round(subtotal * 0.1);
  const total = subtotal + gst + tip;

  return (
    <section id="ai-receipt" className="relative bg-cream text-ink noise overflow-hidden">
      <div className="absolute inset-0 dots-light opacity-50" aria-hidden />
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <SectionHead
              dark={false}
              kicker="AI receipt scanner"
              title={[<>Snap the bill.</>, <><span className="underline-stroke">Split it line-by-line.</span></>]}
              copy="4-stage OCR reads the receipt, parses every dish, and lets you assign each line item to specific travelers — with proportional tax and tip allocation."
            />
            <Reveal delay={200}>
              <div className="mt-8 flex flex-wrap gap-3">
                {OCR_STAGES.map((s, i) => (
                  <div key={s.n} className={`flex items-center gap-2 rounded-full border px-3.5 py-2 transition-all duration-500 ${stage > i ? "bg-sea/10 border-sea/40 text-ink" : "bg-paper border-ink/10 text-ink/50"}`}>
                    <span className="text-sm">{s.emoji}</span>
                    <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">{s.label}</span>
                    {stage > i && <IconCheck size={12} className="text-sea" />}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* receipt + parsed items */}
          <Reveal delay={150}>
            <div className="space-y-4">
              {/* receipt card */}
              <div className="relative rounded-[1.3rem] bg-paper border border-ink/10 p-5 shadow-card rotate-[-1deg] transition-transform duration-500 hover:rotate-0 overflow-hidden">
                {scanning && (
                  <span className="absolute inset-x-3 h-[3px] rounded-full bg-coral shadow-[0_0_18px_4px_rgb(255_90_54/0.7)]" style={{ animation: "scanline 1.4s ease-in-out infinite" }} aria-hidden />
                )}
                <p className="text-center font-mono font-semibold text-[12px] tracking-[0.12em]">THE PALM GROVE</p>
                <p className="text-center font-mono text-[9.5px] text-ink/50 mt-0.5">BAGA BEACH · GOA · GSTIN 30AAK···</p>
                <div className="my-3 border-t border-dashed border-ink/25" />
                <div className="font-mono text-[11px] space-y-1.5">
                  {LINE_ITEMS.map((l) => (
                    <div key={l.name} className={`flex justify-between transition-colors duration-300 ${stage >= 3 ? "text-ink" : "text-ink/40"}`}>
                      <span>{l.name}</span>
                      <span>₹{l.price}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-dashed border-ink/25 pt-2 mt-2 font-bold text-[12.5px]">
                    <span>SUBTOTAL</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-ink/60">
                    <span>GST (5%)</span>
                    <span>₹{gst}</span>
                  </div>
                  <div className="flex justify-between text-ink/60">
                    <span>Tip (10%)</span>
                    <span>₹{tip}</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-ink/25 pt-2 mt-2 font-bold text-[13px]">
                    <span>TOTAL</span>
                    <span>₹{total}</span>
                  </div>
                </div>
              </div>

              {/* line-item assignment */}
              {stage >= 3 && (
                <div className="anim-pop rounded-[1.3rem] bg-ink text-cream p-5 shadow-card">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-coral2">Line-item assignment</p>
                  <ul className="mt-3 space-y-2.5">
                    {LINE_ITEMS.map((l) => (
                      <li key={l.name} className="flex items-center gap-3 rounded-xl bg-cream/5 border border-cream/8 px-3.5 py-2.5">
                        <span className="flex-1 min-w-0">
                          <span className="block font-semibold text-[0.85rem] text-paper truncate">{l.name}</span>
                          <span className="block font-mono text-[10px] text-cream/40 mt-0.5">₹{l.price}</span>
                        </span>
                        <div className="flex -space-x-1.5">
                          {l.assigned.map((n) => (
                            <Avatar key={n} name={n} size={20} ring />
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-sea/10 border border-sea/25 px-4 py-2.5">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-sea">Tax & tip allocated proportionally</span>
                    <IconCheck size={14} className="text-sea" />
                  </div>
                </div>
              )}

              <button
                onClick={startScan}
                className="w-full rounded-xl bg-coral hover:bg-coral2 text-paper font-bold py-3.5 transition-all duration-300 hover:-translate-y-0.5 shadow-[0_10px_28px_-10px_rgb(255_90_54/0.7)] flex items-center justify-center gap-2"
              >
                <IconCamera size={16} /> {scanning ? "Scanning…" : "Scan Receipt"}
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   WHATSAPP SETTLEMENT LEDGER
   ═══════════════════════════════════════════════════════════════ */

export function WhatsAppSettlement() {
  const [copied, setCopied] = useState(false);

  const ledger = `🌴 Goa Coastal Retreat — Settlement Ledger
━━━━━━━━━━━━━━━━━━━━━━
💰 Total Spent: ₹85,000 | 4 Companions

📋 Simplified Payments:
• Rohan Sharma ➔ Alex Traveler: ₹14,250
• Elena Rostova ➔ Vikram Joshi: ₹8,500

✅ All group debts settled via TripSplit!`;

  return (
    <section id="whatsapp-settle" className="relative bg-ink text-cream noise overflow-hidden">
      <div className="absolute inset-0 topo" aria-hidden />
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <SectionHead
              kicker="1-click settlement"
              title={[<>Share the ledger.</>, <><span className="text-coral2">On WhatsApp.</span></>]}
              copy="One tap generates a beautifully formatted settlement summary, copies it to your clipboard, and opens WhatsApp with the message pre-filled — ready to send to the group."
            />
            <Reveal delay={200}>
              <div className="mt-8 flex flex-wrap gap-2.5">
                {["Formatted summary", "1-tap clipboard copy", "WhatsApp pre-filled", "Group-wide broadcast", "Shareable link"].map((f) => (
                  <span key={f} className="rounded-full border border-cream/15 bg-cream/5 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-cream/65">{f}</span>
                ))}
              </div>
            </Reveal>
          </div>

          {/* WhatsApp message preview */}
          <Reveal delay={150}>
            <div className="relative mx-auto max-w-sm">
              <div className="anim-float" style={{ ["--rot" as string]: "-1.2deg" }}>
                <div className="rounded-[1.4rem] bg-[#0b141a] border border-cream/10 p-5 shadow-card">
                  {/* WhatsApp header */}
                  <div className="flex items-center gap-3 pb-3 border-b border-cream/8">
                    <span className="grid place-items-center h-9 w-9 rounded-full bg-sea/20 text-sea font-bold text-sm">G</span>
                    <div>
                      <p className="font-semibold text-[0.9rem] text-paper">Goa Crew 🌴</p>
                      <p className="font-mono text-[9.5px] text-cream/40">4 members · online</p>
                    </div>
                  </div>

                  {/* message bubble */}
                  <div className="mt-4 rounded-xl bg-[#005c4b] p-4 max-w-[90%] ml-auto shadow-lift">
                    <pre className="font-mono text-[11px] text-cream/90 whitespace-pre-wrap leading-relaxed">{ledger}</pre>
                    <p className="mt-2 text-right font-mono text-[9px] text-cream/40">12:42 PM ✓✓</p>
                  </div>

                  {/* action buttons */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }}
                      className={`flex-1 rounded-lg py-2.5 font-bold text-[0.82rem] transition-all duration-300 ${copied ? "bg-sea text-ink" : "bg-cream/10 text-cream hover:bg-cream/20"}`}
                    >
                      {copied ? "✓ Copied" : "📋 Copy"}
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(ledger)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 rounded-lg bg-sea text-ink font-bold text-[0.82rem] py-2.5 text-center hover:bg-sea/90 transition-colors"
                    >
                      💬 Share on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DAY-BY-DAY EXPEDITION + PACKING CHECKLIST
   ═══════════════════════════════════════════════════════════════ */

const EXPEDITION = [
  {
    day: "Day 1",
    date: "Aug 16",
    segments: [
      { time: "🌅 Morning", activity: "Sunrise walk at Baga Beach", detail: "5:30 AM · optional" },
      { time: "☀️ Afternoon", activity: "Check-in + lunch at Ritz Classic", detail: "Fish thali · ₹1,840" },
      { time: "🌇 Sunset", activity: "Clifftop sundowner at Thalassa", detail: "Reserved 6:30 PM" },
      { time: "🌙 Stay", activity: "Villa Serenidad · 4-BR", detail: "PIN: 482196" },
    ],
  },
  {
    day: "Day 2",
    date: "Aug 17",
    segments: [
      { time: "🌅 Morning", activity: "Scuba diving at Grande Island", detail: "PADI certified · ₹4,200" },
      { time: "☀️ Afternoon", activity: "Beach club at Curlies", detail: "Sunbeds reserved" },
      { time: "🌇 Sunset", activity: "Catamaran cruise", detail: "₹3,600 · split 6 ways" },
      { time: "🌙 Stay", activity: "Villa Serenidad · 4-BR", detail: "PIN: 482196" },
    ],
  },
  {
    day: "Day 3",
    date: "Aug 18",
    segments: [
      { time: "🌅 Morning", activity: "Yoga session at Anjuna", detail: "7:00 AM · ₹800" },
      { time: "☀️ Afternoon", activity: "Flea market + lunch", detail: "Shopping budget: ₹5,000" },
      { time: "🌇 Sunset", activity: "Chapora Fort hike", detail: "Free · sunset view" },
      { time: "🌙 Stay", activity: "Villa Serenidad · 4-BR", detail: "PIN: 482196" },
    ],
  },
];

const PACKING = [
  { category: "Clothing", items: ["Swimwear × 3", "Sunscreen hat", "Flip-flops", "Light jacket"], progress: 75 },
  { category: "Documents", items: ["Passport", "Travel insurance", "Hotel confirmations"], progress: 100 },
  { category: "Electronics", items: ["DSLR Camera", "Power bank", "Universal adapter"], progress: 66 },
  { category: "Medical", items: ["First aid kit", "Prescriptions", "Mosquito repellent"], progress: 33 },
];

export function ExpeditionSchedule() {
  const [day, setDay] = useState(0);

  return (
    <section id="expedition" className="relative bg-cream text-ink noise overflow-hidden">
      <div className="absolute inset-0 dots-light opacity-50" aria-hidden />
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 lg:py-32">
        <SectionHead
          dark={false}
          kicker="Expedition planner"
          title={[<>Day-by-day.</>, <><span className="underline-stroke">Packed & ready.</span></>]}
          copy="Organize each day into 4 segments — morning, afternoon, sunset, and stay — with a group packing checklist that tracks progress in real time."
        />

        <div className="mt-14 grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
          {/* expedition timeline */}
          <Reveal>
            <div className="rounded-[1.5rem] bg-ink text-cream p-6 sm:p-7 shadow-card">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-[1.2rem] text-paper">Goa Coastal Retreat</h3>
                <span className="stamp text-sun text-[9px] px-2.5 py-1.5 uppercase">3 Days</span>
              </div>

              {/* day selector */}
              <div className="flex gap-2 mb-5">
                {EXPEDITION.map((d, i) => (
                  <button
                    key={d.day}
                    onClick={() => setDay(i)}
                    className={`flex-1 rounded-xl px-3 py-2.5 text-center transition-all duration-300 ${day === i ? "bg-coral text-paper shadow-lg" : "bg-cream/5 text-cream/60 hover:bg-cream/10"}`}
                  >
                    <span className="block font-display font-bold text-[0.9rem]">{d.day}</span>
                    <span className="block font-mono text-[9px] uppercase tracking-wider mt-0.5">{d.date}</span>
                  </button>
                ))}
              </div>

              {/* segments */}
              <div className="space-y-3">
                {EXPEDITION[day].segments.map((s, i) => (
                  <div key={s.time} className="anim-pop flex items-start gap-3 rounded-xl bg-cream/5 border border-cream/8 px-4 py-3" style={{ animationDelay: `${i * 80}ms` }}>
                    <span className="text-[1.1rem] mt-0.5">{s.time.split(" ")[0]}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-[0.88rem] text-paper">{s.activity}</p>
                      <p className="font-mono text-[10px] text-cream/45 mt-0.5">{s.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* packing checklist */}
          <Reveal delay={150}>
            <div className="rounded-[1.5rem] bg-paper border border-ink/10 p-6 sm:p-7 shadow-lift">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-[1.2rem]">Group Packing</h3>
                <span className="rounded-full bg-sea/10 text-sea px-3 py-1 font-mono text-[10px] uppercase tracking-wider font-semibold">
                  {Math.round(PACKING.reduce((s, p) => s + p.progress, 0) / PACKING.length)}% done
                </span>
              </div>

              <div className="space-y-4">
                {PACKING.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-[0.9rem]">{cat.category}</p>
                      <span className="font-mono text-[10px] text-ink/50">{cat.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-cream2 overflow-hidden mb-2">
                      <div className="h-full rounded-full bg-gradient-to-r from-sea to-sky2 transition-all duration-700" style={{ width: `${cat.progress}%` }} />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.items.map((item) => (
                        <span key={item} className="rounded-full bg-cream border border-ink/8 px-2.5 py-1 font-mono text-[9.5px] text-ink/60">{item}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MULTI-CURRENCY CONVERTER + BUDGET HEALTH
   ═══════════════════════════════════════════════════════════════ */

const CURRENCIES = [
  { code: "INR", symbol: "₹", rate: 1 },
  { code: "USD", symbol: "$", rate: 0.012 },
  { code: "EUR", symbol: "€", rate: 0.011 },
  { code: "GBP", symbol: "£", rate: 0.0095 },
  { code: "JPY", symbol: "¥", rate: 1.82 },
  { code: "AED", symbol: "د.إ", rate: 0.044 },
  { code: "THB", symbol: "฿", rate: 0.43 },
];

export function MultiCurrency() {
  const [amount, setAmount] = useState(10000);
  const [from, setFrom] = useState("INR");

  const converted = useMemo(() => {
    const fromRate = CURRENCIES.find((c) => c.code === from)?.rate ?? 1;
    const base = amount / fromRate;
    return CURRENCIES.map((c) => ({
      code: c.code,
      symbol: c.symbol,
      value: Math.round(base * c.rate * 100) / 100,
    }));
  }, [amount, from]);

  const budget = 100000;
  const spent = 68420;
  const pct = (spent / budget) * 100;

  return (
    <section id="multi-currency" className="relative bg-ink text-cream noise overflow-hidden">
      <div className="absolute inset-0 topo" aria-hidden />
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 lg:py-32">
        <SectionHead
          kicker="Multi-currency"
          title={[<>One amount.</>, <><span className="text-coral2">Seven currencies.</span></>]}
          copy="Instant conversion between INR, USD, EUR, GBP, JPY, AED, and THB — with a live budget health gauge that tracks spend against your group's total."
        />

        <div className="mt-14 grid lg:grid-cols-2 gap-6">
          {/* converter */}
          <Reveal>
            <div className="rounded-[1.5rem] border border-cream/10 bg-ink2/85 p-6 sm:p-7 shadow-card">
              <h3 className="font-display font-bold text-[1.15rem] text-paper mb-5">Live converter</h3>

              {/* input */}
              <div className="flex gap-3 mb-5">
                <select
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="rounded-xl bg-ink border border-cream/12 px-4 py-3 font-mono text-[0.9rem] text-paper outline-none focus:border-coral/60 transition-colors"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.code}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                  className="flex-1 rounded-xl bg-ink border border-cream/12 px-4 py-3 font-display font-bold text-[1.1rem] text-paper outline-none focus:border-coral/60 transition-colors tabular-nums"
                />
              </div>

              {/* converted values */}
              <div className="space-y-2">
                {converted.map((c) => (
                  <div key={c.code} className="flex items-center justify-between rounded-xl bg-ink border border-cream/8 px-4 py-2.5 transition-colors hover:border-cream/20">
                    <span className="font-mono text-[11px] text-cream/50">{c.code}</span>
                    <span className="font-display font-bold text-[1rem] text-paper tabular-nums">
                      {c.symbol}{c.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* budget health */}
          <Reveal delay={150}>
            <div className="rounded-[1.5rem] border border-cream/10 bg-ink2/85 p-6 sm:p-7 shadow-card">
              <h3 className="font-display font-bold text-[1.15rem] text-paper mb-5">Budget health</h3>

              {/* gauge */}
              <div className="relative mb-6">
                <div className="flex items-end justify-between mb-2">
                  <span className="font-display font-bold text-[2rem] text-paper tabular-nums">{inr(spent)}</span>
                  <span className="font-mono text-[11px] text-cream/50">of {inr(budget)}</span>
                </div>
                <div className="h-4 rounded-full bg-ink overflow-hidden border border-cream/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sea via-sun to-coral transition-all duration-1000"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 font-mono text-[10px] text-cream/50">
                  <span>{Math.round(pct)}% consumed</span>
                  <span className="text-sea">{inr(budget - spent)} remaining</span>
                </div>
              </div>

              {/* category breakdown */}
              <div className="space-y-3">
                {[
                  { cat: "Accommodation", pct: 42, color: "#FF5A36" },
                  { cat: "Food", pct: 24, color: "#FFB350" },
                  { cat: "Transport", pct: 18, color: "#6AB9E9" },
                  { cat: "Activities", pct: 11, color: "#35C98E" },
                  { cat: "Other", pct: 5, color: "#9B7BE8" },
                ].map((c) => (
                  <div key={c.cat}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-[0.85rem] text-cream/80">{c.cat}</span>
                      <span className="font-mono text-[10px] text-cream/50">{c.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-ink overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${c.pct}%`, backgroundColor: c.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DISCOVER DIRECTORY + COMPARISON MATRIX
   ═══════════════════════════════════════════════════════════════ */

const VENUES = [
  { name: "Villa Serenidad", cat: "🏨 Stays", price: 24000, rating: 4.8, capacity: 8, amenities: ["Pool", "Wi-Fi", "Chef", "AC"] },
  { name: "Thalassa", cat: "🍽️ Dining", price: 3500, rating: 4.6, capacity: 40, amenities: ["Sunset view", "Seafood", "Bar"] },
  { name: "Scuba Shack", cat: "🏄 Adventures", price: 4200, rating: 4.9, capacity: 6, amenities: ["PADI", "Equipment", "Photos"] },
  { name: "Curlies Beach Club", cat: "🍹 Nightlife", price: 2800, rating: 4.4, capacity: 100, amenities: ["Sunbeds", "Live music", "Bar"] },
];

export function DiscoverDirectory() {
  const [selected, setSelected] = useState<number[]>([]);
  const [query, setQuery] = useState("");

  const filtered = VENUES.filter((v) => v.name.toLowerCase().includes(query.toLowerCase()));

  const toggle = (i: number) => {
    setSelected((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : prev.length < 4 ? [...prev, i] : prev);
  };

  return (
    <section id="discover" className="relative bg-cream text-ink noise overflow-hidden">
      <div className="absolute inset-0 dots-light opacity-50" aria-hidden />
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 lg:py-32">
        <SectionHead
          dark={false}
          kicker="Discover directory"
          title={[<>Find. Compare.</>, <><span className="underline-stroke">Book.</span></>]}
          copy="Fuzzy search across verified stays, dining, and adventures — then compare up to 4 venues side-by-side on price, capacity, ratings, and amenities."
        />

        <div className="mt-14 space-y-6">
          {/* search */}
          <Reveal>
            <div className="flex gap-3 max-w-2xl mx-auto">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search venues, cities, categories…"
                className="flex-1 rounded-full bg-paper border border-ink/12 px-6 py-3.5 font-body text-[0.95rem] text-ink outline-none focus:border-coral/60 transition-colors shadow-lift"
              />
              <button className="rounded-full bg-ink text-cream px-6 py-3.5 font-bold text-[0.9rem] hover:bg-ink3 transition-colors shadow-lift">
                🔍 Search
              </button>
            </div>
          </Reveal>

          {/* venue cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filtered.map((v, i) => {
              const isSelected = selected.includes(i);
              return (
                <Reveal key={v.name} delay={i * 80}>
                  <button
                    onClick={() => toggle(i)}
                    className={`w-full text-left rounded-[1.3rem] border p-5 shadow-lift transition-all duration-300 hover:-translate-y-1 ${isSelected ? "bg-ink text-cream border-coral/50 shadow-card" : "bg-paper border-ink/10 hover:border-coral/40"}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`rounded-full px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider font-semibold ${isSelected ? "bg-coral/15 text-coral2" : "bg-cream2 text-ink/60"}`}>{v.cat}</span>
                      {isSelected && <IconCheck size={14} className="text-sea" />}
                    </div>
                    <h3 className={`font-display font-bold text-[1.05rem] ${isSelected ? "text-paper" : "text-ink"}`}>{v.name}</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`font-display font-bold text-[1.1rem] tabular-nums ${isSelected ? "text-sun" : "text-ink"}`}>₹{v.price.toLocaleString()}</span>
                      <span className={`font-mono text-[10px] ${isSelected ? "text-cream/40" : "text-ink/40"}`}>/ person</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-amber-500">⭐</span>
                      <span className={`font-semibold text-[0.85rem] ${isSelected ? "text-cream/80" : "text-ink/70"}`}>{v.rating}</span>
                      <span className={`font-mono text-[10px] ${isSelected ? "text-cream/40" : "text-ink/40"}`}>· {v.capacity} pax</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {v.amenities.map((a) => (
                        <span key={a} className={`rounded-full px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-wider ${isSelected ? "bg-cream/10 text-cream/60" : "bg-cream2 text-ink/50"}`}>{a}</span>
                      ))}
                    </div>
                  </button>
                </Reveal>
              );
            })}
          </div>

          {/* comparison matrix */}
          {selected.length >= 2 && (
            <Reveal delay={200}>
              <div className="rounded-[1.5rem] bg-ink text-cream p-6 sm:p-7 shadow-card anim-pop">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display font-bold text-[1.15rem] text-paper">Side-by-side comparison</h3>
                  <span className="font-mono text-[10px] text-cream/40">{selected.length} venues selected</span>
                </div>
                <div className="overflow-x-auto scrollbar-none">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="border-b border-cream/10">
                        <th className="text-left font-mono text-[10px] uppercase tracking-wider text-cream/40 pb-3 pr-4">Feature</th>
                        {selected.map((i) => (
                          <th key={i} className="text-left font-display font-bold text-[0.9rem] text-paper pb-3 pr-4">{VENUES[i].name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cream/8">
                      {[
                        { label: "Price / person", render: (v: typeof VENUES[0]) => `₹${v.price.toLocaleString()}` },
                        { label: "Rating", render: (v: typeof VENUES[0]) => `⭐ ${v.rating}` },
                        { label: "Capacity", render: (v: typeof VENUES[0]) => `${v.capacity} pax` },
                        { label: "Category", render: (v: typeof VENUES[0]) => v.cat },
                        { label: "Amenities", render: (v: typeof VENUES[0]) => v.amenities.join(", ") },
                      ].map((row) => (
                        <tr key={row.label}>
                          <td className="font-mono text-[10px] uppercase tracking-wider text-cream/40 py-3 pr-4">{row.label}</td>
                          {selected.map((i) => (
                            <td key={i} className="font-semibold text-[0.85rem] text-cream/80 py-3 pr-4">{row.render(VENUES[i])}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
