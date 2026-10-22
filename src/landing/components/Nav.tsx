'use client';
import { useEffect, useState } from "react";
import { Logo, IconMenu, IconCross, IconArrow, IconInstagram, IconXSocial, IconLinkedIn } from "../lib/icons";

const LINKS = [
  { label: "Features", href: "#features" },
  { label: "Discover", href: "#discover" },
  { label: "Book", href: "#book" },
  { label: "For Hosts", href: "#vendor" },
  { label: "Insights", href: "#insights" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      setPastHero(window.scrollY > 640);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-ink/85 backdrop-blur-xl shadow-[0_10px_40px_-18px_rgb(0_0_0/0.7)] border-b border-cream/8"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <nav className="mx-auto max-w-7xl px-5 sm:px-8 h-[68px] flex items-center justify-between gap-4" aria-label="Main">
          <a href="#top" className="flex items-center gap-2.5 group" aria-label="TripSplit home">
            <span className="transition-transform duration-500 group-hover:rotate-[14deg] group-hover:-translate-y-0.5">
              <Logo size={32} />
            </span>
            <span className="font-display font-bold text-[1.32rem] tracking-tight text-paper">
              Trip<span className="text-coral">Split</span>
            </span>
          </a>

          <ul className="hidden lg:flex items-center gap-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="px-3.5 py-2 rounded-full text-[0.9rem] font-medium text-cream/75 hover:text-paper hover:bg-cream/8 transition-colors duration-300"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden lg:flex items-center gap-3">
            <a
              href="/login"
              className="text-[0.9rem] font-semibold text-cream/80 hover:text-paper px-3 py-2 transition-colors"
            >
              Log in
            </a>
            <a
              href="#get-started"
              className="group inline-flex items-center gap-2 rounded-full bg-coral hover:bg-coral2 px-5 py-2.5 text-[0.9rem] font-bold text-paper transition-all duration-300 hover:-translate-y-0.5 shadow-[0_8px_24px_-8px_rgb(255_90_54/0.7)]"
            >
              Create a Trip
              <IconArrow size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>

          <button
            className="lg:hidden p-2.5 -mr-2 text-paper rounded-xl hover:bg-cream/10 transition-colors"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            <IconMenu size={24} />
          </button>
        </nav>
      </header>

      {/* mobile drawer */}
      <div
        className={`fixed inset-0 z-[70] lg:hidden transition-all duration-500 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
        <div
          className={`absolute inset-y-0 right-0 w-[86%] max-w-sm bg-ink2 border-l border-cream/10 p-7 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-coral2">Menu</span>
            <button
              className="p-2.5 -mr-2 text-paper rounded-xl hover:bg-cream/10 transition-colors"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <IconCross size={22} />
            </button>
          </div>
          <nav className="mt-10 flex flex-col gap-1.5" aria-label="Mobile">
            {LINKS.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`font-display font-bold text-[1.7rem] text-paper/90 hover:text-coral2 py-2.5 border-b border-cream/8 transition-all duration-500 ${
                  open ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
                }`}
                style={{ transitionDelay: open ? `${120 + i * 60}ms` : "0ms" }}
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-auto space-y-3">
            <a
              href="#get-started"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 rounded-full bg-coral px-5 py-4 font-bold text-paper"
            >
              Create a Trip <IconArrow size={16} />
            </a>
            <a
              href="/login"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center rounded-full border border-cream/20 px-5 py-3.5 font-semibold text-cream/85"
            >
              Log in
            </a>
            <div className="flex items-center justify-center gap-4 pt-3 text-cream/50">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-coral2 transition-colors"><IconInstagram size={19} /></a>
              <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X" className="hover:text-coral2 transition-colors"><IconXSocial size={17} /></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-coral2 transition-colors"><IconLinkedIn size={19} /></a>
            </div>
          </div>
        </div>
      </div>

      {/* sticky mobile CTA */}
      <div
        className={`fixed bottom-4 inset-x-4 z-[60] lg:hidden transition-all duration-500 ${
          pastHero && !open ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"
        }`}
      >
        <a
          href="#get-started"
          className="flex items-center justify-between gap-3 rounded-full bg-ink2/95 backdrop-blur-xl border border-cream/12 px-5 py-3 shadow-[0_18px_50px_-12px_rgb(0_0_0/0.8)]"
        >
          <span className="flex items-center gap-2.5">
            <Logo size={26} />
            <span>
              <span className="block font-display font-bold text-paper text-[0.95rem] leading-tight">Start your trip</span>
              <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-cream/50">Free to get started</span>
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-coral px-4 py-2 text-[0.82rem] font-bold text-paper">
            Create <IconArrow size={13} />
          </span>
        </a>
      </div>
    </>
  );
}
