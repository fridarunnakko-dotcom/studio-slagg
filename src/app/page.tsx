export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-screen px-6">
      <p
        className="text-xs tracking-widest uppercase mb-8"
        style={{ fontFamily: "var(--font-ui)", color: "var(--void)" }}
      >
        Skrap. Yta. Rum.
      </p>
      <h1
        className="text-6xl md:text-8xl font-black uppercase tracking-tight leading-none text-center"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        Studio Slagg
      </h1>
      <div
        className="mt-12 w-16"
        style={{ height: "1px", background: "var(--line-strong)" }}
      />
      <p
        className="mt-8 text-sm"
        style={{ fontFamily: "var(--font-body)", color: "var(--dust)" }}
      >
        info@studioslagg.se
      </p>
    </main>
  );
}
