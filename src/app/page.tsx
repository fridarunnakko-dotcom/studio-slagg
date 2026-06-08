import { Logo } from "@/components/Logo";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-screen px-6">
      <p
        className="text-xs tracking-widest uppercase mb-12"
        style={{ fontFamily: "var(--font-ui)", color: "var(--void)" }}
      >
        Skrap. Yta. Rum.
      </p>
      <Logo
        className="w-full max-w-2xl"
        style={{ color: "var(--ink)" }}
      />
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
      <p
        className="mt-4 text-xs"
        style={{ fontFamily: "var(--font-ui)", color: "var(--concrete)" }}
      >
        Benjamin was here &lt;3
      </p>
    </main>
  );
}
