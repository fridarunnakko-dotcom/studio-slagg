import { HeroStamp } from "@/components/HeroStamp";
import { SelectedWorks } from "@/components/SelectedWorks";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      {/* Hero — full viewport */}
      <section className="flex flex-col items-center justify-center min-h-screen px-6 gap-12">
        <p
          className="text-xs tracking-widest uppercase"
          style={{ fontFamily: "var(--font-ui)", color: "var(--void)" }}
        >
          Skrap. Yta. Rum.
        </p>

        <HeroStamp />

        <div className="flex flex-col items-center gap-4">
          <div
            className="w-16"
            style={{ height: "1px", background: "var(--line-strong)" }}
          />
          <p
            className="text-sm"
            style={{ fontFamily: "var(--font-body)", color: "var(--dust)" }}
          >
            info@studioslagg.se
          </p>
          <p
            className="text-xs"
            style={{ fontFamily: "var(--font-ui)", color: "var(--concrete)" }}
          >
            Benjamin was here &lt;3
          </p>
        </div>
      </section>

      {/* Selected works */}
      <SelectedWorks />

      {/* Footer */}
      <Footer />
    </>
  );
}
