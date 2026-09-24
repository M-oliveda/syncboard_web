import { MotionConfig } from "framer-motion";

import { CtaSection } from "@/components/marketing/CtaSection";
import { FaqSection } from "@/components/marketing/FaqSection";
import { FeatureHighlights } from "@/components/marketing/FeatureHighlights";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";

export function LandingPage() {
    return (
        <MotionConfig reducedMotion="user">
            <div className="flex min-h-screen flex-col">
                <MarketingHeader />
                <main className="flex-1 pt-16">
                    <Hero />
                    <FeatureHighlights />
                    <HowItWorks />
                    <FaqSection />
                    <CtaSection />
                </main>
                <MarketingFooter />
            </div>
        </MotionConfig>
    );
}
