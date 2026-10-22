'use client';

import Nav from "./components/Nav";
import Hero from "./components/Hero";
import { Problem, ValueModules } from "./components/Sections1";
import { Planner, Splitter, Timeline } from "./components/Sections2";
import { Finance, Settlement, Receipts } from "./components/Sections3";
import { MapSection, Friends, Reminders } from "./components/Sections4";
import { Insights, Achievements, Story, YearReview } from "./components/Sections5";
import { Comparison, HowItWorks, Mobile, Security } from "./components/Sections6";
import { Testimonials, FeatureGrid, Pricing, Faq, FinalCta, Footer } from "./components/Sections7";
import { VendorCommerce, SmartKey, AdminConsole, DirectBooking } from "./components/Sections8";
import { AIReceipt, WhatsAppSettlement, ExpeditionSchedule, MultiCurrency, DiscoverDirectory } from "./components/Sections9";

export default function LandingPage() {
  return (
    <div className="font-body bg-ink text-cream selection:bg-coral selection:text-paper min-h-screen">
      <Nav />
      <main>
        <Hero />
        <Problem />
        <ValueModules />
        <Planner />
        <ExpeditionSchedule />
        <Splitter />
        <Timeline />
        <Finance />
        <MultiCurrency />
        <AIReceipt />
        <Settlement />
        <WhatsAppSettlement />
        <Receipts />
        <MapSection />
        <DiscoverDirectory />
        <Friends />
        <Reminders />
        <Insights />
        <Achievements />
        <Story />
        <YearReview />
        <VendorCommerce />
        <SmartKey />
        <AdminConsole />
        <DirectBooking />
        <Comparison />
        <HowItWorks />
        <Mobile />
        <Security />
        <Testimonials />
        <FeatureGrid />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
