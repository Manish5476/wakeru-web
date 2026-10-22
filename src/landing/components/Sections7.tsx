'use client';
import { useState } from "react";
import { SectionHead, Reveal, MaskLines, Avatar, BtnLink, inr } from "../lib/ui";
import {
  IconArrow, IconCheck, IconRoute, IconReceipt, IconSplit, IconWallet, IconChart, IconUsers,
  IconCamera, IconMap, IconCompass, IconBell, IconTrophy, IconMedal, IconPin, IconSpark,
  IconInstagram, IconXSocial, IconLinkedIn, Logo, IconPlane, IconCalendar, IconLink, IconEye,
  IconTicket, IconLock, IconShield,
} from "../lib/icons";
import { IMG } from "../lib/images";

/* ================= TESTIMONIALS ================= */
const QUOTES = [
  {
    q: "Nine friends. Seven days. Dozens of expenses. TripSplit kept everything organized without turning the trip into accounting.",
    name: "Aarav",
    trip: "Manali · 9 travelers",
    stamp: "MANALI",
    rot: "-2.2deg",
  },
  {
    q: "The best thing is that everyone knows exactly where they stand. No awkward money talks on the last night.",
    name: "Sarah",
    trip: "Goa Getaway · 4 travelers",
    stamp: "GOA",
    rot: "1.6deg",
  },
  {
    q: "It feels less like an expense app and more like having a travel assistant that happens to be great at math.",
    name: "Daniel",
    trip: "Vietnam · 6 travelers",
    stamp: "HANOI",
    rot: "-1.2deg",
  },
];

export function Testimonials() {
  return (
    <section id="stories" className="relative bg-ink text-cream noise overflow-hidden">
      <div className="absolute inset-0 topo" aria-hidden />
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 lg:py-32">
        <SectionHead
          kicker="Postcards from real trips"
          title={[<>Travelers do the math.</>, <>We just made it disappear.</>]}
        />
        <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {QUOTES.map((t, i) => (
            <Reveal key={t.name} delay={i * 140}>
              <figure
                className="group relative h-full rounded-2xl bg-paper text-ink p-6 pt-8 shadow-card transition-all duration-500 rotate-(--rot) hover:rotate-0 hover:-translate-y-2"
                style={{ ["--rot" as string]: t.rot }}
              >
                {/* postage stamp */}
                <span className="absolute right-4 top-4 grid place-items-center h-14 w-12 border-2 border-dashed border-coral/50 text-coral rotate-6 bg-cream transition-transform duration-500 group-hover:rotate-0">
                  <IconPlane size={18} />
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-ink/40">{t.stamp} ✈ 2026</span>
                <blockquote className="mt-4 font-display text-[1.12rem] font-medium leading-relaxed text-ink/90">
                  “{t.q}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-dashed border-ink/15 pt-4">
                  <Avatar name={t.name} size={38} />
                  <span>
                    <span className="block font-bold text-[0.95rem]">{t.name}</span>
                    <span className="block font-mono text-[10px] uppercase tracking-wider text-ink/50 mt-0.5">{t.trip}</span>
                  </span>
                  <span className="stamp ml-auto text-sea text-[8px] px-2.5 py-1.5 uppercase">Verified trip</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= FEATURE GRID ================= */
const FEATURES: { icon: React.ReactNode; title: string; copy: string }[] = [
  { icon: <IconRoute size={19} />, title: "Trip Planning", copy: "Plan destinations, stops, itineraries and travel details." },
  { icon: <IconCalendar size={19} />, title: "Day-by-Day Schedule", copy: "Organize each day into morning, afternoon, sunset and stay segments." },
  { icon: <IconCheck size={19} />, title: "Packing Checklist", copy: "Group packing list with real-time progress tracking." },
  { icon: <IconReceipt size={19} />, title: "Expense Tracking", copy: "Track every expense across the journey." },
  { icon: <IconCamera size={19} />, title: "AI Receipt OCR", copy: "4-stage scanner parses dishes, prices, tax and tips automatically." },
  { icon: <IconSplit size={19} />, title: "Smart Splitting", copy: "Equal, custom, or line-item assignment with proportional tax." },
  { icon: <IconCheck size={19} />, title: "Settlements", copy: "Greedy min-cash-flow algorithm simplifies who owes whom." },
  { icon: <IconLink size={19} />, title: "WhatsApp Ledger", copy: "1-click formatted settlement share via WhatsApp." },
  { icon: <IconWallet size={19} />, title: "Multi-Currency", copy: "Live conversion across INR, USD, EUR, GBP, JPY, AED and THB." },
  { icon: <IconChart size={19} />, title: "Budget Health", copy: "Real-time gauge of spend vs. budget with category breakdown." },
  { icon: <IconCompass size={19} />, title: "Discover Directory", copy: "Fuzzy search across verified stays, dining and adventures." },
  { icon: <IconEye size={19} />, title: "Comparison Matrix", copy: "Compare up to 4 venues side-by-side on price, rating and amenities." },
  { icon: <IconUsers size={19} />, title: "Friends", copy: "Travel and collaborate with your crew." },
  { icon: <IconMap size={19} />, title: "Maps", copy: "Visualize your journey and destinations." },
  { icon: <IconCompass size={19} />, title: "Insights", copy: "Understand your travel and spending patterns." },
  { icon: <IconBell size={19} />, title: "Reminders", copy: "Never forget a payment." },
  { icon: <IconTrophy size={19} />, title: "Achievements", copy: "Turn travel milestones into achievements." },
  { icon: <IconMedal size={19} />, title: "Leaderboards", copy: "Compete with your travel crew." },
  { icon: <IconPin size={19} />, title: "Trip Stories", copy: "Turn completed trips into memories." },
  { icon: <IconSpark size={19} />, title: "Year in Review", copy: "See your entire travel year." },
  { icon: <IconTicket size={19} />, title: "Vendor Commerce", copy: "Host portal with GPS capture, smart keys, CRM and flash offers." },
  { icon: <IconLock size={19} />, title: "IoT Smart Key", copy: "Keyless check-in with 6-digit PIN, Wi-Fi and validity windows." },
  { icon: <IconShield size={19} />, title: "Admin Console", copy: "KPIs, verification queue, demand velocity and audit logs." },
  { icon: <IconPin size={19} />, title: "Direct Booking", copy: "Book villas, guides, and experiences directly from verified hosts. No middlemen." },
];

export function FeatureGrid() {
  return (
    <section id="all-features" className="relative bg-cream text-ink noise overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 lg:py-28">
        <SectionHead
          dark={false}
          kicker="The full toolkit"
          title={[<>Fifteen things you can stop</>, <>juggling between apps.</>]}
        />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 90}>
              <div className="group flex items-start gap-4 rounded-2xl bg-paper border border-ink/10 p-5 transition-all duration-300 hover:border-coral/50 hover:-translate-y-1 hover:shadow-lift h-full">
                <span className="grid place-items-center h-10 w-10 rounded-xl bg-ink text-coral2 transition-all duration-500 group-hover:bg-coral group-hover:text-paper group-hover:-rotate-6 shrink-0">
                  {f.icon}
                </span>
                <span>
                  <span className="block font-display font-bold text-[1.02rem] tracking-tight">{f.title}</span>
                  <span className="block mt-1 text-[0.85rem] text-ink/60 leading-relaxed">{f.copy}</span>
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= PRICING ================= */
export function Pricing() {
  return (
    <section id="pricing" className="relative bg-ink text-cream noise overflow-hidden">
      <div className="absolute inset-0 dots-dark opacity-60" aria-hidden />
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 lg:py-32">
        <SectionHead
          center
          kicker="Pricing"
          title={[<>Start free. Upgrade</>, <>when the trips get bigger.</>]}
          copy="No card needed to plan your first trip."
        />

        <div className="mt-14 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
          {/* free */}
          <Reveal>
            <div className="relative h-full rounded-[1.5rem] border border-cream/12 bg-ink2/85 p-7 sm:p-8 flex flex-col overflow-hidden">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cream/50">Drifter</p>
              <p className="mt-3 font-display font-bold text-[2.6rem] text-paper leading-none">Free</p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-cream/45">forever · every trip</p>
              <div className="my-6 flex items-center gap-4" aria-hidden>
                <span className="h-px flex-1 bg-cream/10" />
                <span className="perf-y h-6" />
                <span className="h-px flex-1 bg-cream/10" />
              </div>
              <ul className="space-y-3">
                {["Unlimited trips & itineraries", "Expense tracking & smart splitting", "Simplified settlements", "Trip budgets & timeline", "Invite up to 8 travelers per trip"].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[0.92rem] text-cream/80">
                    <span className="grid place-items-center rounded-full bg-sea/15 text-sea" style={{ height: 22, width: 22 }}><IconCheck size={12} /></span>
                    {f}
                  </li>
                ))}
              </ul>
              <a href="#get-started" className="group mt-8 inline-flex items-center justify-center gap-2 rounded-full border border-cream/25 hover:border-cream/60 hover:bg-cream/8 px-6 py-3.5 font-bold text-[0.92rem] transition-all duration-300 hover:-translate-y-0.5">
                Start for free <IconArrow size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
          </Reveal>
          {/* plus */}
          <Reveal delay={140}>
            <div className="relative h-full rounded-[1.5rem] border border-coral/40 bg-gradient-to-b from-ink3 to-ink2 p-7 sm:p-8 flex flex-col overflow-hidden shadow-[0_24px_60px_-24px_rgb(255_90_54/0.4)]">
              <span className="stamp absolute right-5 top-5 text-sun text-[9px] px-3 py-2 uppercase">Early access</span>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-coral2">Explorer</p>
              <p className="mt-3 font-display font-bold text-[2.6rem] text-paper leading-none">
                {inr(149)} <span className="text-[1rem] font-body font-medium text-cream/55">per trip</span>
              </p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-cream/45">split it — that's the point</p>
              <div className="my-6 flex items-center gap-4" aria-hidden>
                <span className="h-px flex-1 bg-cream/10" />
                <span className="perf-y h-6" />
                <span className="h-px flex-1 bg-cream/10" />
              </div>
              <ul className="space-y-3">
                {["Everything in Drifter", "Receipt scanning & auto-filing", "Insights & spending analytics", "Trip stories & Year in Review", "Achievements & leaderboards", "Unlimited travelers per trip"].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[0.92rem] text-cream/85">
                    <span className="grid place-items-center rounded-full bg-coral/15 text-coral2" style={{ height: 22, width: 22 }}><IconCheck size={12} /></span>
                    {f}
                  </li>
                ))}
              </ul>
              <a href="#get-started" className="group mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-coral hover:bg-coral2 px-6 py-3.5 font-bold text-[0.92rem] text-paper transition-all duration-300 hover:-translate-y-0.5 shadow-[0_12px_32px_-10px_rgb(255_90_54/0.7)]">
                Get Explorer <IconArrow size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
          </Reveal>
        </div>
        <Reveal delay={250}>
          <p className="mt-8 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-cream/45">
            Free to get started · Explorer is rolling out to early-access crews first
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= FAQ ================= */
const FAQS = [
  { q: "What is TripSplit?", a: "TripSplit is a travel companion for groups — one app that combines trip planning, shared expense tracking, fair splitting, settlements, travel insights, friends, reminders, achievements and trip memories." },
  { q: "Is TripSplit only for splitting expenses?", a: "No. Splitting is one part of the journey. TripSplit covers the whole arc: plan the itinerary, track spending, manage budgets, settle up, then relive the trip through stories, insights and your year in review." },
  { q: "Can I plan my entire trip in TripSplit?", a: "Yes — destinations, stops, dates, travel segments, bookings and budget live on one itinerary timeline that your whole crew can see and edit." },
  { q: "Can multiple people add expenses?", a: "Absolutely. Everyone in the trip can add expenses in real time. Each one is timestamped, categorized and attributed to the person who paid." },
  { q: "Can expenses be split differently?", a: "Yes. Split equally, by custom amounts, or by weighted shares — TripSplit recalculates everyone's share instantly and always balances to the exact rupee." },
  { q: "How does TripSplit calculate settlements?", a: "It uses a greedy min-cash-flow algorithm that works out each person's net balance, then simplifies the group into the fewest possible payments — so three transfers can replace six." },
  { q: "Can I track a trip budget?", a: "Yes. Set a budget, watch spend against it in real time, and see burn-per-day, category breakdowns and what's left." },
  { q: "Can I invite friends?", a: "Yes — share an invite link, manage your crew, and keep a history of shared trips and activity with each friend." },
  { q: "Can I track receipts?", a: "Yes. Attach receipt photos to expenses, or use the AI OCR scanner that reads the bill in 4 stages — contrast, OCR, dish parsing, and tax verification — then assigns each line item to specific travelers." },
  { q: "Does TripSplit work for couples and families?", a: "Very well. It works for any group size from two upwards — honeymoons, family reunions, festivals, road trips." },
  { q: "Can I see my travel history?", a: "Yes. Completed trips become stories with stats, stops and memories, and everything feeds your personal travel history." },
  { q: "What are TripSplit achievements?", a: "Milestones you earn by traveling — trips completed, destinations visited, budgets honored, streaks kept. Fun, lightly competitive, never naggy." },
  { q: "Can I see my year in review?", a: "Yes. At year-end TripSplit wraps your trips, cities, friends, spending and achievements into a personal travel recap." },
  { q: "Does TripSplit support multiple currencies?", a: "Yes. Live conversion between INR, USD, EUR, GBP, JPY, AED and THB — with a budget health gauge that tracks spend against your group's total in real time." },
  { q: "Can I share the settlement on WhatsApp?", a: "Yes. One tap generates a beautifully formatted settlement summary, copies it to your clipboard, and opens WhatsApp with the message pre-filled — ready to send to the group." },
  { q: "Is there a day-by-day itinerary planner?", a: "Yes. Organize each day into 4 segments — morning, afternoon, sunset and stay — with a group packing checklist that tracks progress in real time." },
  { q: "Can I discover and compare venues?", a: "Yes. The Discover Directory lets you search verified stays, dining and adventures, then compare up to 4 venues side-by-side on price, capacity, ratings and amenities." },
  { q: "Can vendors and hosts list their properties?", a: "Yes. Wakeru Local equips boutique villas, beach clubs, dive schools and dining lounges with GPS capture, smart keys, CRM leads, flash offers, verified reviews, and a 5-stage conversion funnel." },
  { q: "What is the IoT smart key?", a: "Every confirmed booking auto-generates a digital pass — a 6-digit PIN for the physical lock, Wi-Fi credentials, and a validity window that expires on checkout. No keys to lose, no queues to stand in." },
  { q: "Is there an admin console for platform operators?", a: "Yes. One console shows platform KPIs, partner verification queue, regional demand velocity intelligence, and immutable audit logs — everything trust & safety and investors need." },
  { q: "Can I book villas, guides, and experiences directly on TripSplit?", a: "Yes. TripSplit × Wakeru connects you directly with verified hosts — boutique villas, local guides, dive schools, beach clubs, and experiences. No middlemen, no 15% commission markup. The price you see is the price you pay." },
  { q: "How does TripSplit compare to Ixigo or MakeMyTrip?", a: "Unlike OTAs that charge 15–22% commission, TripSplit connects you directly with verified hosts. You pay the listed price with no hidden convenience fees. An average group of 6 saves around ₹8,400 on a 4-night Goa trip." },
];

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="relative bg-cream text-ink noise overflow-hidden">
      <div className="absolute inset-0 dots-light opacity-50" aria-hidden />
      <div className="relative z-10 mx-auto max-w-4xl px-5 sm:px-8 py-24 lg:py-32">
        <SectionHead
          dark={false}
          center
          kicker="FAQ"
          title={[<>Questions? Boarding answers.</>]}
        />
        <div className="mt-12 space-y-3">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={Math.min(i * 50, 300)}>
              <div className={`rounded-2xl border transition-all duration-300 ${open === i ? "bg-paper border-coral/40 shadow-lift" : "bg-paper/60 border-ink/10 hover:border-ink/30"}`}>
                <button
                  onClick={() => setOpen(open === i ? -1 : i)}
                  aria-expanded={open === i}
                  className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4.5 text-left py-5"
                >
                  <span className="font-display font-bold text-[1.02rem] tracking-tight">{f.q}</span>
                  <span className={`grid place-items-center h-8 w-8 rounded-full shrink-0 transition-all duration-400 ${open === i ? "bg-coral text-paper rotate-45" : "bg-ink/6 text-ink/60"}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  </span>
                </button>
                <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <p className="px-5 sm:px-6 pb-5 text-[0.95rem] leading-relaxed text-ink/70 max-w-2xl">{f.a}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= FINAL CTA ================= */
export function FinalCta() {
  return (
    <section id="get-started" className="relative overflow-hidden noise">
      <img src={IMG.ctaFinal} alt="Friends walking along a shoreline at dusk" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/45" />
      <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8 py-28 lg:py-40 text-center">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-sun flex items-center justify-center gap-3">
            <IconPlane size={15} /> Final boarding call
          </p>
        </Reveal>
        <MaskLines
          as="h2"
          className="font-display font-bold tracking-tight text-paper mt-6 text-[clamp(2.2rem,5.4vw,4rem)] leading-[1.05] text-balance"
          lines={[<>The best trips aren't remembered</>, <>for the spreadsheets.</>]}
        />
        <Reveal delay={200}>
          <p className="mt-6 text-[1.15rem] text-cream/85 max-w-xl mx-auto">
            Plan less. Track less. Worry less. <strong className="text-paper">Travel more.</strong>
          </p>
        </Reveal>
        <Reveal delay={320}>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <a href="#top" className="group inline-flex items-center gap-2.5 rounded-full bg-coral hover:bg-coral2 px-8 py-4 font-bold text-paper text-[1rem] transition-all duration-300 hover:-translate-y-0.5 shadow-[0_18px_50px_-12px_rgb(255_90_54/0.85)]">
              Create Your First Trip
              <IconArrow size={17} className="transition-transform duration-300 group-hover:translate-x-1.5" />
            </a>
            <a href="#features" className="inline-flex items-center gap-2 rounded-full border border-cream/35 hover:border-cream/70 hover:bg-cream/10 px-8 py-4 font-semibold text-cream transition-all duration-300">
              Explore TripSplit
            </a>
          </div>
        </Reveal>
        <Reveal delay={420}>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-cream/60">Free to get started · your crew will thank you</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= FOOTER ================= */
const FOOT = [
  {
    h: "Product",
    links: [["Features", "#features"], ["Trip Planner", "#planner"], ["Expense Splitting", "#split"], ["Settlements", "#settle"], ["Discover", "#discover"], ["AI Receipt OCR", "#ai-receipt"], ["Insights", "#insights"], ["Achievements", "#achievements"]],
  },
  {
    h: "For Hosts",
    links: [["Vendor Commerce", "#vendor"], ["IoT Smart Key", "#smartkey"], ["Flash Offers", "#vendor"], ["CRM Leads", "#vendor"], ["Analytics", "#vendor"]],
  },
  {
    h: "Platform",
    links: [["Admin Console", "#admin"], ["Direct Booking", "#book"], ["Security", "#security"], ["How It Works", "#how"]],
  },
  {
    h: "Company",
    links: [["About", "#top"], ["Contact", "mailto:hello@tripsplit.app"], ["Careers", "mailto:careers@tripsplit.app"], ["Help Center", "#faq"], ["Privacy", "#security"], ["Terms", "#security"]],
  },
];

export function Footer() {
  return (
    <footer className="relative bg-ink text-cream border-t border-cream/8 overflow-hidden">
      {/* animated route */}
      <svg className="absolute top-8 left-0 w-full h-16 opacity-25" viewBox="0 0 1400 60" preserveAspectRatio="none" aria-hidden>
        <path d="M0 40 C 200 10, 400 60, 700 30 S 1200 10, 1400 35" fill="none" stroke="#FF5A36" strokeWidth="2" strokeDasharray="7 8" className="anim-dash" />
      </svg>
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 pt-20 pb-10">
        <div className="grid lg:grid-cols-[1.2fr_2fr] gap-12">
          <div>
            <a href="#top" className="flex items-center gap-2.5 w-fit group">
              <span className="transition-transform duration-500 group-hover:rotate-[14deg]"><Logo size={34} /></span>
              <span className="font-display font-bold text-[1.5rem] tracking-tight text-paper">Trip<span className="text-coral">Split</span></span>
            </a>
            <p className="mt-4 font-display font-bold text-[1.1rem] text-cream/85">Travel together. Split smarter.</p>
            <p className="mt-2 text-[0.9rem] text-cream/55 max-w-xs leading-relaxed">
              Plan the adventure. Share the expenses. Keep the memories.
            </p>
            <div className="mt-6 flex gap-3">
              {[
                { icon: <IconInstagram size={18} />, label: "Instagram", href: "https://instagram.com" },
                { icon: <IconXSocial size={16} />, label: "X", href: "https://x.com" },
                { icon: <IconLinkedIn size={18} />, label: "LinkedIn", href: "https://linkedin.com" },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} className="grid place-items-center h-10 w-10 rounded-full border border-cream/15 text-cream/70 transition-all duration-300 hover:border-coral hover:text-coral2 hover:-translate-y-1">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {FOOT.map((col) => (
              <nav key={col.h} aria-label={col.h}>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-cream/45">{col.h}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <a href={href} className="text-[0.9rem] text-cream/70 hover:text-coral2 transition-colors duration-300 inline-flex items-center gap-1.5 group/link">
                        <span className="h-px w-0 bg-coral2 transition-all duration-300 group-hover/link:w-3" />
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="mt-14 pt-7 border-t border-cream/8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[11px] text-cream/45">© 2026 TripSplit × Wakeru. Made for better trips.</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cream/35 flex items-center gap-2">
            GOA <IconPlane size={12} className="text-coral2/60" /> BALI <IconPlane size={12} className="text-coral2/60" /> NEXT?
          </p>
        </div>
      </div>
    </footer>
  );
}
