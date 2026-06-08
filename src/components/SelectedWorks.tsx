import { SELECTED_WORKS } from "@/data/works";
import { WorkCard } from "./WorkCard";

export function SelectedWorks() {
  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-24">
      {/* Header */}
      <div
        className="flex items-baseline justify-between mb-12"
        style={{ borderBottom: "1px solid var(--line-strong)", paddingBottom: 16 }}
      >
        <h2
          className="text-xs uppercase tracking-widest"
          style={{ fontFamily: "var(--font-ui)", color: "var(--void)" }}
        >
          Utvalda verk
        </h2>
        <a
          href="/verk"
          className="text-xs uppercase tracking-widest"
          style={{ fontFamily: "var(--font-ui)", color: "var(--void)" }}
        >
          Visa alla verk →
        </a>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {SELECTED_WORKS.map((work) => (
          <WorkCard key={work.id} work={work} />
        ))}
      </div>

      {/* CTA */}
      <div className="flex justify-center mt-16">
        <a
          href="/verk"
          className="px-8 py-3 text-xs uppercase tracking-widest"
          style={{
            fontFamily: "var(--font-ui)",
            background: "var(--ink)",
            color: "var(--paper)",
            borderRadius: 0,
          }}
        >
          Visa alla verk
        </a>
      </div>
    </section>
  );
}
