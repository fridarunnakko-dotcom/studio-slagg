import { HeroStamp } from "@/components/HeroStamp";
import { SelectedWorks } from "@/components/SelectedWorks";
import { Footer } from "@/components/Footer";
import { ThreeCanvas } from "@/components/ThreeCanvas";
import { defaultConcreteSettings } from "@/components/ConcreteControls";

export default function Home() {
  return (
    <>
      {/* Fixed background texture */}
      <ThreeCanvas settings={defaultConcreteSettings} />

      {/* Logo — fixed so it feels embedded in the surface */}
      <div className="fixed inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <HeroStamp />
      </div>

      {/* Spacer that gives the page its scroll height for the hero */}
      <div style={{ height: "100vh" }} />

      {/* Content scrolls over the hero */}
      <div className="relative z-20" style={{ background: "var(--paper)" }}>
        <SelectedWorks />
        <Footer />
      </div>
    </>
  );
}
