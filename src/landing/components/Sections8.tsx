'use client';
import { useState } from "react";
import { SectionHead, Reveal, CountUp, inr, Avatar, Kicker, MaskLines } from "../lib/ui";
import {
  IconCheck, IconCross, IconArrow, IconPin, IconShield, IconChart, IconUsers,
  IconWallet, IconCamera, IconBell, IconReceipt, IconMap, IconSpark, IconLock,
  IconTicket, IconPlus, IconEye, IconCalendar,
} from "../lib/icons";

/* ═══════════════════════════════════════════════════════════════
   VENDOR COMMERCE PLATFORM — the biggest new section
   ═══════════════════════════════════════════════════════════════ */

const CATEGORIES = [
  { emoji: "🏨", name: "Stays & Villas", count: 128, color: "#FF5A36" },
  { emoji: "🍽️", name: "Dining & Clubs", count: 214, color: "#FFB350" },
  { emoji: "🏄", name: "Adventures", count: 87, color: "#35C98E" },
  { emoji: "🍹", name: "Nightlife", count: 63, color: "#6AB9E9" },
  { emoji: "🧘", name: "Wellness", count: 41, color: "#9B7BE8" },
];

const FUNNEL = [
  { stage: "Catalog Views", value: 12840, pct: 100 },
  { stage: "Detail Opened", value: 4920, pct: 38 },
  { stage: "Price Checked", value: 2180, pct: 17 },
  { stage: "Booking Requested", value: 842, pct: 6.5 },
  { stage: "Confirmed & Key Issued", value: 614, pct: 4.8 },
];

const BOOKINGS = [
  { guest: "Arjun Mehta", party: 6, dates: "Aug 18–22", status: "ACCEPTED", amount: 48000 },
  { guest: "Priya Nair", party: 4, dates: "Aug 20–23", status: "REQUESTED", amount: 32000 },
  { guest: "Sarah Chen", party: 8, dates: "Aug 24–28", status: "REQUESTED", amount: 72000 },
  { guest: "Rahul Verma", party: 2, dates: "Aug 16–18", status: "DECLINED", amount: 18000 },
];

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; dot: string }> = {
    ACCEPTED: { bg: "bg-sea/12", text: "text-sea", dot: "bg-sea" },
    REQUESTED: { bg: "bg-sun/12", text: "text-sun", dot: "bg-sun" },
    DECLINED: { bg: "bg-coral/12", text: "text-coral2", dot: "bg-coral" },
    COMPLETED: { bg: "bg-sky2/12", text: "text-sky2", dot: "bg-sky2" },
  };
  const s = map[status] ?? map.REQUESTED;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${s.bg} ${s.text} px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider font-semibold`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

export function VendorCommerce() {
  const [tab, setTab] = useState<"bookings" | "analytics" | "leads">("bookings");
  const [declineOpen, setDeclineOpen] = useState(false);

  return (
    <section id="vendor" className="relative bg-cream text-ink noise overflow-hidden">
      <div className="absolute inset-0 dots-light opacity-50" aria-hidden />
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-14 items-start">
          {/* left — pitch */}
          <div className="lg:sticky lg:top-28">
            <SectionHead
              dark={false}
              kicker="For hosts & vendors"
              title={[<>Turn your property</>, <>into a <span className="underline-stroke">booking machine.</span></>]}
              copy="Wakeru Local equips boutique villas, beach clubs, dive schools and dining lounges with everything they need — GPS capture, smart keys, CRM leads, flash offers, and a 5-stage conversion funnel."
            />

            <Reveal delay={200}>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {CATEGORIES.map((c) => (
                  <div key={c.name} className="rounded-xl bg-paper border border-ink/10 px-4 py-3.5 shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:border-coral/40">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[1.2rem]">{c.emoji}</span>
                      <div>
                        <p className="font-display font-bold text-[0.92rem] leading-tight">{c.name}</p>
                        <p className="font-mono text-[10px] text-ink/45 mt-0.5">{c.count} verified</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={320}>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {["📍 1-click GPS capture", "🔑 IoT smart keys", "💬 WhatsApp CRM", "🏷️ Flash offers", "⭐ Verified reviews"].map((f) => (
                  <span key={f} className="rounded-full bg-ink text-cream px-3.5 py-1.5 font-mono text-[10.5px] uppercase tracking-wider">{f}</span>
                ))}
              </div>
            </Reveal>
          </div>

          {/* right — live dashboard */}
          <div className="space-y-5">
            <Reveal>
              <div className="rounded-[1.5rem] bg-ink text-cream p-6 sm:p-7 shadow-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid place-items-center h-10 w-10 rounded-xl bg-coral/12 text-coral2"><IconTicket size={18} /></span>
                    <div>
                      <h3 className="font-display font-bold text-[1.15rem] text-paper">Villa Serenidad</h3>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-cream/45">Anjuna, Goa · 🏨 Stays & Villas</p>
                    </div>
                  </div>
                  <span className="stamp text-sea text-[9px] px-2.5 py-1.5 uppercase">Verified ✓</span>
                </div>

                {/* tabs */}
                <div className="mt-5 flex gap-1.5 p-1 rounded-full bg-cream/8 border border-cream/10">
                  {(["bookings", "analytics", "leads"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`flex-1 px-3 py-2 rounded-full text-[0.78rem] font-bold capitalize transition-all duration-300 ${tab === t ? "bg-coral text-paper shadow-lg" : "text-cream/55 hover:text-cream"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* bookings tab */}
                {tab === "bookings" && (
                  <div className="mt-5 anim-pop">
                    <div className="flex gap-2 mb-4">
                      {[
                        { label: "Requested", count: 2, color: "sun" },
                        { label: "Accepted", count: 1, color: "sea" },
                        { label: "Declined", count: 1, color: "coral" },
                      ].map((p) => (
                        <span key={p.label} className={`rounded-full bg-${p.color}/10 text-${p.color} px-3 py-1 font-mono text-[10px] uppercase tracking-wider font-semibold`}>
                          {p.label} · {p.count}
                        </span>
                      ))}
                    </div>
                    <ul className="space-y-2.5">
                      {BOOKINGS.map((b) => (
                        <li key={b.guest} className="flex items-center gap-3 rounded-xl bg-cream/5 border border-cream/8 px-4 py-3 transition-colors hover:border-cream/20">
                          <Avatar name={b.guest} size={30} />
                          <span className="flex-1 min-w-0">
                            <span className="block font-semibold text-[0.88rem] text-paper truncate">{b.guest}</span>
                            <span className="block font-mono text-[10px] text-cream/45 mt-0.5">{b.party} guests · {b.dates}</span>
                          </span>
                          <span className="font-display font-bold text-[0.95rem] text-paper tabular-nums">{inr(b.amount)}</span>
                          <StatusPill status={b.status} />
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 rounded-xl bg-sea text-ink font-bold text-[0.82rem] py-2.5 hover:bg-sea/90 transition-colors">✓ Accept</button>
                      <button onClick={() => setDeclineOpen(!declineOpen)} className="flex-1 rounded-xl bg-coral/15 text-coral2 border border-coral/30 font-bold text-[0.82rem] py-2.5 hover:bg-coral/25 transition-colors">✕ Decline</button>
                    </div>
                    {declineOpen && (
                      <div className="mt-3 rounded-xl bg-cream/5 border border-cream/10 p-3 anim-pop">
                        <p className="font-mono text-[9.5px] uppercase tracking-wider text-cream/50 mb-2">Decline reason</p>
                        <div className="space-y-1.5">
                          {["Fully booked for this date", "Property under maintenance", "Party size exceeds capacity", "Custom reason"].map((r) => (
                            <label key={r} className="flex items-center gap-2.5 rounded-lg bg-cream/5 px-3 py-2 cursor-pointer hover:bg-cream/10 transition-colors">
                              <span className="h-4 w-4 rounded-full border border-cream/30" />
                              <span className="text-[0.82rem] text-cream/80">{r}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* analytics tab */}
                {tab === "analytics" && (
                  <div className="mt-5 anim-pop">
                    <div className="flex gap-2 mb-4">
                      <span className="rounded-full bg-cream/10 text-paper px-3 py-1 font-mono text-[10px] uppercase tracking-wider font-semibold">Last 30 days</span>
                      <span className="rounded-full text-cream/40 px-3 py-1 font-mono text-[10px] uppercase tracking-wider">Last 3 months</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 mb-5">
                      {[
                        { k: "Catalog views", v: <CountUp to={12840} />, note: "+28.4%" },
                        { k: "Unique visitors", v: <CountUp to={4920} />, note: "+12.1%" },
                        { k: "Direct leads", v: <CountUp to={842} />, note: "+34.7%" },
                        { k: "GMV (INR)", v: <CountUp to={1840000} prefix="₹" />, note: "+41.2%" },
                      ].map((s) => (
                        <div key={s.k} className="rounded-xl bg-cream/5 border border-cream/8 p-3">
                          <p className="font-mono text-[9px] uppercase tracking-wider text-cream/40">{s.k}</p>
                          <p className="font-display font-bold text-[1.15rem] text-paper tabular-nums mt-1">{s.v}</p>
                          <p className="font-mono text-[10px] text-sea mt-0.5">{s.note}</p>
                        </div>
                      ))}
                    </div>
                    <p className="font-mono text-[9.5px] uppercase tracking-wider text-cream/45 mb-2.5">5-stage conversion funnel</p>
                    <div className="space-y-1.5">
                      {FUNNEL.map((f, i) => (
                        <div key={f.stage} className="flex items-center gap-3">
                          <span className="w-28 font-mono text-[10px] text-cream/60 truncate">{f.stage}</span>
                          <div className="flex-1 h-5 rounded bg-cream/5 overflow-hidden">
                            <div
                              className="h-full rounded transition-all duration-1000"
                              style={{
                                width: `${f.pct}%`,
                                background: `linear-gradient(90deg, #FF5A36 ${i * 20}%, #FFB350 100%)`,
                              }}
                            />
                          </div>
                          <span className="w-14 text-right font-mono text-[10px] text-cream/60 tabular-nums">{f.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* leads tab */}
                {tab === "leads" && (
                  <div className="mt-5 anim-pop">
                    <div className="flex gap-2 mb-4">
                      {[
                        { label: "Hot", count: 3, color: "coral" },
                        { label: "Warm", count: 5, color: "sun" },
                        { label: "Contacted", count: 2, color: "sky2" },
                      ].map((p) => (
                        <span key={p.label} className={`rounded-full bg-${p.color}/10 text-${p.color} px-3 py-1 font-mono text-[10px] uppercase tracking-wider font-semibold`}>
                          {p.label} · {p.count}
                        </span>
                      ))}
                    </div>
                    <ul className="space-y-2.5">
                      {[
                        { name: "Rohan Sharma", phone: "+91 98xxx 44210", dates: "Sep 12–16", party: 6, temp: "HOT" },
                        { name: "Elena Rostova", phone: "+91 87xxx 11904", dates: "Sep 20–24", party: 4, temp: "WARM" },
                        { name: "Vikram Joshi", phone: "+91 99xxx 77382", dates: "Oct 02–07", party: 8, temp: "HOT" },
                      ].map((l) => (
                        <li key={l.name} className="flex items-center gap-3 rounded-xl bg-cream/5 border border-cream/8 px-4 py-3">
                          <Avatar name={l.name} size={30} />
                          <span className="flex-1 min-w-0">
                            <span className="block font-semibold text-[0.88rem] text-paper truncate">{l.name}</span>
                            <span className="block font-mono text-[10px] text-cream/45 mt-0.5">{l.party} guests · {l.dates}</span>
                          </span>
                          <StatusPill status={l.temp === "HOT" ? "ACCEPTED" : l.temp === "WARM" ? "REQUESTED" : "COMPLETED"} />
                          <a
                            href={`https://wa.me/${l.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${l.name.split(" ")[0]}! Thanks for your interest in Villa Serenidad for ${l.dates}. We'd love to host your group of ${l.party}.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="grid place-items-center h-9 w-9 rounded-full bg-sea/15 text-sea hover:bg-sea/25 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            💬
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Reveal>

            {/* GPS capture card */}
            <Reveal delay={200}>
              <div className="rounded-[1.3rem] bg-paper border border-ink/10 p-5 shadow-lift">
                <div className="flex items-center gap-3">
                  <span className="grid place-items-center h-10 w-10 rounded-xl bg-coral/10 text-coral"><IconPin size={18} /></span>
                  <div className="flex-1">
                    <p className="font-display font-bold text-[0.95rem]">1-click GPS capture</p>
                    <p className="font-mono text-[10.5px] text-ink/50 mt-0.5">15.5045° N, 73.8278° E · Anjuna Beach</p>
                  </div>
                  <button className="rounded-full bg-ink text-cream px-4 py-2 font-bold text-[0.78rem] hover:bg-ink3 transition-colors">
                    📍 Capture
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   IoT SMART KEY — keyless check-in
   ═══════════════════════════════════════════════════════════════ */

export function SmartKey() {
  const [unlocked, setUnlocked] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <section id="smartkey" className="relative bg-ink text-cream noise overflow-hidden">
      <div className="absolute inset-0 topo" aria-hidden />
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <SectionHead
              kicker="IoT smart key"
              title={[<>Keyless check-in.</>, <><span className="text-coral2">Zero front desk.</span></>]}
              copy="Every confirmed booking auto-generates a digital pass — a 6-digit PIN for the physical lock, Wi-Fi credentials, and a validity window that expires on checkout. No keys to lose, no queues to stand in."
            />
            <Reveal delay={200}>
              <ul className="mt-8 space-y-3 max-w-md">
                {[
                  ["🔐", "6-digit access PIN for Yale / August / Tuya locks"],
                  ["📶", "Wi-Fi SSID + password with 1-click copy"],
                  ["📱", "NFC tap-to-unlock simulation with haptic strike"],
                  ["⏰", "Strict validFrom → validTo expiry windows"],
                  ["🎫", "Auto-issued on booking confirmation"],
                ].map(([icon, text]) => (
                  <li key={text} className="flex items-center gap-3 text-[0.92rem] text-cream/80">
                    <span className="text-lg">{icon}</span>
                    {text}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* key card */}
          <Reveal delay={150}>
            <div className="relative mx-auto max-w-sm">
              <div className="anim-float" style={{ ["--rot" as string]: "-1.5deg" }}>
                <div className={`rounded-[1.6rem] p-6 sm:p-7 shadow-card transition-all duration-700 ${unlocked ? "bg-gradient-to-br from-sea/20 to-ink2 border-2 border-sea/50" : "bg-gradient-to-br from-ink3 to-ink2 border border-cream/15"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <IconLock size={18} className={unlocked ? "text-sea" : "text-coral2"} />
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream/50">Digital Pass</span>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider font-semibold ${unlocked ? "bg-sea/15 text-sea" : "bg-coral/10 text-coral2"}`}>
                      {unlocked ? "UNLOCKED" : "LOCKED"}
                    </span>
                  </div>

                  <div className="mt-5">
                    <p className="font-display font-bold text-[1.3rem] text-paper">Villa Serenidad</p>
                    <p className="font-mono text-[10.5px] text-cream/45 mt-1">4-BR · Anjuna Beach · Aug 18–22</p>
                  </div>

                  {/* PIN display */}
                  <div className="mt-6 rounded-xl bg-ink/70 border border-cream/10 p-4">
                    <p className="font-mono text-[9.5px] uppercase tracking-wider text-cream/45">Access PIN</p>
                    <p className="mt-1.5 font-mono font-bold text-[2rem] text-paper tracking-[0.3em] tabular-nums">
                      {unlocked ? "4 8 2 1 9 6" : "• • • • • •"}
                    </p>
                  </div>

                  {/* Wi-Fi */}
                  <div className="mt-3 rounded-xl bg-ink/70 border border-cream/10 p-4 flex items-center justify-between">
                    <div>
                      <p className="font-mono text-[9.5px] uppercase tracking-wider text-cream/45">Wi-Fi</p>
                      <p className="font-display font-bold text-[0.95rem] text-paper mt-0.5">VillaSerenidad_5G</p>
                      <p className="font-mono text-[11px] text-cream/50 mt-0.5">Pass: sunset@2026</p>
                    </div>
                    <button
                      onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1600); }}
                      className={`rounded-lg px-3 py-2 font-mono text-[10px] uppercase tracking-wider font-semibold transition-all duration-300 ${copied ? "bg-sea text-ink" : "bg-cream/10 text-cream/70 hover:bg-cream/20"}`}
                    >
                      {copied ? "✓ Copied" : "Copy"}
                    </button>
                  </div>

                  {/* validity */}
                  <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-cream/45">
                    <span>Valid from: Aug 18, 2:00 PM</span>
                    <span>→ Aug 22, 11:00 AM</span>
                  </div>

                  {/* unlock button */}
                  <button
                    onClick={() => setUnlocked(!unlocked)}
                    className={`mt-5 w-full rounded-xl py-3.5 font-bold text-[0.92rem] transition-all duration-500 ${unlocked ? "bg-ink border border-cream/20 text-cream hover:bg-ink3" : "bg-coral text-paper hover:bg-coral2 shadow-[0_8px_24px_-8px_rgb(255_90_54/0.6)]"}`}
                  >
                    {unlocked ? "🔒 Lock" : "🔓 Tap to Unlock"}
                  </button>
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
   ADMIN CONSOLE — trust & investor credibility
   ═══════════════════════════════════════════════════════════════ */

const DEMAND_HUBS = [
  { hub: "Goa", growth: "+28.4%", avgParty: "5.4", advance: "14–21 days" },
  { hub: "Manali & Kasol", growth: "+19.2%", avgParty: "4.8", advance: "21–28 days" },
  { hub: "Jaipur & Udaipur", growth: "+15.7%", avgParty: "3.6", advance: "10–14 days" },
  { hub: "Pondicherry", growth: "+22.1%", avgParty: "4.2", advance: "7–14 days" },
  { hub: "Munnar & Wayanad", growth: "+17.8%", avgParty: "3.9", advance: "14–21 days" },
];

const AUDIT_LOG = [
  { action: "VERIFICATION_APPROVED", actor: "admin@wakeru", time: "2m ago", icon: "✓" },
  { action: "BOOKING_ACCEPT", actor: "vendor#4821", time: "8m ago", icon: "🔑" },
  { action: "EXPENSE_CREATE", actor: "user#1142", time: "12m ago", icon: "💸" },
  { action: "KYC_SUBMIT", actor: "vendor#7732", time: "24m ago", icon: "📋" },
  { action: "SETTLEMENT_COMPLETE", actor: "user#8821", time: "38m ago", icon: "🤝" },
];

export function AdminConsole() {
  return (
    <section id="admin" className="relative bg-cream text-ink noise overflow-hidden">
      <div className="absolute inset-0 dots-light opacity-50" aria-hidden />
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 lg:py-32">
        <SectionHead
          dark={false}
          kicker="Platform operations"
          title={[<>One console for</>, <>the entire ecosystem.</>]}
          copy="KPIs, verification queues, regional demand velocity, and immutable audit logs — everything platform operators, trust & safety, and investors need in one place."
        />

        <div className="mt-14 grid lg:grid-cols-3 gap-5">
          {/* KPIs */}
          <Reveal>
            <div className="rounded-[1.4rem] bg-ink text-cream p-6 shadow-card h-full">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream/45">Platform KPIs</p>
              <div className="mt-4 space-y-4">
                {[
                  { k: "Registered partners", v: <CountUp to={1247} />, note: "+184 this month" },
                  { k: "Verified vendors", v: <CountUp to={892} />, note: "71.5% verified" },
                  { k: "Pending media", v: <CountUp to={342} />, note: "12 in review queue" },
                  { k: "Total GMV", v: <CountUp to={48200000} prefix="₹" />, note: "+41.2% MoM" },
                ].map((s) => (
                  <div key={s.k} className="flex items-center justify-between border-b border-cream/8 pb-3 last:border-0 last:pb-0">
                    <span>
                      <span className="block font-semibold text-[0.88rem] text-paper">{s.k}</span>
                      <span className="block font-mono text-[10px] text-cream/40 mt-0.5">{s.note}</span>
                    </span>
                    <span className="font-display font-bold text-[1.2rem] text-paper tabular-nums">{s.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* demand velocity */}
          <Reveal delay={120}>
            <div className="rounded-[1.4rem] bg-paper border border-ink/10 p-6 shadow-lift h-full">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40">Regional demand velocity</p>
              <ul className="mt-4 space-y-2.5">
                {DEMAND_HUBS.map((h) => (
                  <li key={h.hub} className="flex items-center gap-2.5 rounded-lg bg-cream px-3 py-2.5 border border-ink/6 transition-colors hover:border-coral/40">
                    <IconPin size={13} className="text-coral shrink-0" />
                    <span className="flex-1 min-w-0">
                      <span className="block font-semibold text-[0.82rem] truncate">{h.hub}</span>
                      <span className="block font-mono text-[9.5px] text-ink/45 mt-0.5">{h.avgParty} travelers · {h.advance}</span>
                    </span>
                    <span className="font-mono text-[11px] text-sea font-semibold">{h.growth}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* audit log */}
          <Reveal delay={240}>
            <div className="rounded-[1.4rem] bg-ink text-cream p-6 shadow-card h-full">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream/45">Immutable audit log</p>
                <IconShield size={14} className="text-sea" />
              </div>
              <ul className="mt-4 space-y-2.5">
                {AUDIT_LOG.map((log, i) => (
                  <li key={i} className="flex items-center gap-3 rounded-lg bg-cream/5 border border-cream/8 px-3 py-2.5">
                    <span className="text-[0.9rem]">{log.icon}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-mono text-[10.5px] text-paper font-semibold truncate">{log.action}</span>
                      <span className="block font-mono text-[9px] text-cream/40 mt-0.5">{log.actor} · {log.time}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 font-mono text-[9.5px] text-cream/35 uppercase tracking-wider">Chronological · tamper-proof · RBAC-gated</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DIRECT BOOKING COMMERCE — book villas, guides, experiences
   directly from verified hosts. No middlemen. No commission markup.
   ═══════════════════════════════════════════════════════════════ */

const BOOKABLE = [
  {
    emoji: "🏨",
    name: "Villa Serenidad",
    location: "Anjuna, Goa",
    price: 24000,
    per: "night",
    rating: 4.8,
    reviews: 142,
    capacity: "Up to 8 guests",
    amenities: ["Pool", "5G Wi-Fi", "Chef", "AC", "Ocean view"],
    badge: "Early bird −20%",
  },
  {
    emoji: "🏄",
    name: "Grande Island Scuba",
    location: "Mormugao, Goa",
    price: 4200,
    per: "person",
    rating: 4.9,
    reviews: 287,
    capacity: "Groups of 2–6",
    amenities: ["PADI certified", "Equipment", "Photos", "Lunch"],
    badge: "Group of 6+ · ₹500 off",
  },
  {
    emoji: "🧭",
    name: "Ravi — Local Guide",
    location: "Old Goa · Panjim",
    price: 2800,
    per: "half-day",
    rating: 5.0,
    reviews: 93,
    capacity: "Up to 10 travelers",
    amenities: ["Heritage walks", "Portuguese era", "Food stops", "Hindi/English"],
    badge: "Verified local",
  },
  {
    emoji: "🍽️",
    name: "Thalassa Sunset Dinner",
    location: "Vagator, Goa",
    price: 3500,
    per: "person",
    rating: 4.6,
    reviews: 412,
    capacity: "Tables of 4–12",
    amenities: ["Clifftop", "Seafood", "Live music", "Sunset view"],
    badge: "Free airport transfer",
  },
];

const COMPARISON = [
  { feature: "Booking commission", tripsplit: "0%", others: "15–22%" },
  { feature: "Host payout", tripsplit: "100%", others: "78–85%" },
  { feature: "You pay", tripsplit: "Listed price", others: "Listed + GST + convenience fee" },
  { feature: "Smart key on confirm", tripsplit: "✓ Auto", others: "✗ Call the host" },
  { feature: "Expense auto-logged", tripsplit: "✓ In your trip", others: "✗ Separate receipt" },
  { feature: "Group booking", tripsplit: "✓ Per-person packages", others: "✗ One reservation" },
];

export function DirectBooking() {
  return (
    <section id="book" className="relative bg-cream text-ink noise overflow-hidden">
      <div className="absolute inset-0 dots-light opacity-50" aria-hidden />
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-14 items-start">
          {/* left — the pitch */}
          <div className="lg:sticky lg:top-28">
            <SectionHead
              dark={false}
              kicker="Direct booking commerce"
              title={[<>Book the trip.</>, <><span className="underline-stroke">Don't just track it.</span></>]}
              copy="TripSplit × Wakeru connects you directly with verified villas, local guides, dive schools, beach clubs and experiences. No middlemen. No 15% commission. No hidden convenience fees. The price you see is the price you pay."
            />

            <Reveal delay={200}>
              <div className="mt-8 rounded-[1.3rem] bg-ink text-cream p-6 shadow-card">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-coral2">You save vs. Ixigo / MakeMyTrip / Airbnb</p>
                <div className="mt-4 space-y-0">
                  {COMPARISON.map((row, i) => (
                    <div key={row.feature} className={`grid grid-cols-3 gap-3 py-3 ${i < COMPARISON.length - 1 ? "border-b border-cream/8" : ""}`}>
                      <span className="text-[0.85rem] text-cream/70">{row.feature}</span>
                      <span className="text-[0.88rem] font-bold text-sea">{row.tripsplit}</span>
                      <span className="text-[0.85rem] text-cream/45 line-through decoration-coral/60 decoration-1">{row.others}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-sea/10 border border-sea/25 px-3 py-2.5">
                  <IconCheck size={14} className="text-sea" />
                  <p className="text-[0.82rem] text-sea">
                    Average group of 6 saves <strong>₹8,400</strong> on a 4-night Goa trip.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {["🏨 Villas & stays", "🧭 Local guides", "🏄 Adventures", "🍽️ Dining", "🧘 Wellness", "🍹 Nightlife"].map((c) => (
                  <span key={c} className="rounded-full bg-paper border border-ink/10 px-3.5 py-1.5 font-semibold text-[0.82rem] text-ink/75">{c}</span>
                ))}
              </div>
            </Reveal>
          </div>

          {/* right — bookable listings */}
          <div className="space-y-4">
            {BOOKABLE.map((v, i) => (
              <Reveal key={v.name} delay={i * 100}>
                <article className="group rounded-[1.3rem] bg-paper border border-ink/10 p-5 shadow-lift transition-all duration-300 hover:-translate-y-1 hover:border-coral/40 hover:shadow-card">
                  <div className="flex items-start gap-4">
                    <span className="grid place-items-center h-14 w-14 rounded-xl bg-cream text-[1.8rem] shrink-0">{v.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-display font-bold text-[1.1rem] leading-tight">{v.name}</h3>
                          <p className="font-mono text-[10.5px] text-ink/50 mt-0.5 flex items-center gap-1.5">
                            <IconPin size={11} className="text-coral" /> {v.location}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-coral/10 text-coral px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-wider font-semibold whitespace-nowrap">
                          {v.badge}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1 text-[0.85rem] font-semibold">
                          <span className="text-amber-500">⭐</span> {v.rating}
                          <span className="font-mono text-[10.5px] text-ink/45">({v.reviews})</span>
                        </span>
                        <span className="font-mono text-[10.5px] text-ink/45">· {v.capacity}</span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {v.amenities.map((a) => (
                          <span key={a} className="rounded-full bg-cream2 px-2.5 py-0.5 font-mono text-[9.5px] text-ink/60">{a}</span>
                        ))}
                      </div>

                      <div className="mt-4 flex items-end justify-between gap-3">
                        <div>
                          <p className="font-display font-bold text-[1.35rem] tabular-nums">
                            ₹{v.price.toLocaleString()}
                          </p>
                          <p className="font-mono text-[10px] text-ink/45">per {v.per} · no hidden fees</p>
                        </div>
                        <button className="rounded-full bg-ink text-cream px-5 py-2.5 font-bold text-[0.82rem] hover:bg-coral transition-colors duration-300 flex items-center gap-1.5 group-hover:bg-coral">
                          Book now <IconArrow size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}

            <Reveal delay={450}>
              <div className="rounded-[1.3rem] bg-ink text-cream p-5 shadow-card flex items-center gap-4">
                <span className="grid place-items-center h-12 w-12 rounded-xl bg-sea/15 text-sea shrink-0">
                  <IconShield size={20} />
                </span>
                <div className="flex-1">
                  <p className="font-display font-bold text-[0.98rem] text-paper">Every host is verified.</p>
                  <p className="text-[0.82rem] text-cream/60 mt-0.5">GSTIN, business license, and property address reviewed by our team. Only verified partners can list.</p>
                </div>
                <span className="stamp text-sea text-[9px] px-2.5 py-1.5 uppercase shrink-0">Verified ✓</span>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
