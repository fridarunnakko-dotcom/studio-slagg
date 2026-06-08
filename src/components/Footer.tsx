"use client";

import { useState } from "react";

function FooterCol({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <p
        className="text-xs uppercase tracking-widest"
        style={{ fontFamily: "var(--font-ui)", color: "var(--void)" }}
      >
        {heading}
      </p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-sm w-fit"
      style={{ fontFamily: "var(--font-body)", color: "var(--ink)", fontWeight: 300 }}
    >
      {children}
    </a>
  );
}

function NewsletterBelt() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  return (
    <div
      className="w-full py-10 px-6"
      style={{ borderTop: "1px solid var(--line-strong)", borderBottom: "1px solid var(--line-strong)" }}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <p
            className="text-xs uppercase tracking-widest"
            style={{ fontFamily: "var(--font-ui)", color: "var(--void)" }}
          >
            Nyhetsbrev
          </p>
          <p
            className="text-sm"
            style={{ fontFamily: "var(--font-body)", color: "var(--ink)", fontWeight: 300 }}
          >
            Nya verk, processer och urval — direkt i inkorgen.
          </p>
        </div>

        {submitted ? (
          <p
            className="text-xs uppercase tracking-widest"
            style={{ fontFamily: "var(--font-ui)", color: "var(--void)" }}
          >
            Tack. Vi hör av oss.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-0 w-full sm:w-auto">
            <input
              type="email"
              placeholder="din@email.se"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 sm:w-64 px-4 py-2 text-sm outline-none"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 300,
                color: "var(--ink)",
                background: "var(--paper)",
                border: "1px solid var(--line-strong)",
                borderRight: "none",
                borderRadius: 0,
              }}
            />
            <button
              type="submit"
              className="px-5 py-2 text-xs uppercase tracking-widest shrink-0"
              style={{
                fontFamily: "var(--font-ui)",
                background: "var(--ink)",
                color: "var(--paper)",
                borderRadius: 0,
              }}
            >
              Prenumerera
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer style={{ background: "var(--paper)" }}>
      <NewsletterBelt />

      {/* Four columns */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-2 lg:grid-cols-4 gap-10">
        <FooterCol heading="Studio Slagg">
          <p
            className="text-sm leading-relaxed"
            style={{ fontFamily: "var(--font-body)", color: "var(--ink)", fontWeight: 300 }}
          >
            Konstnärligt studio mellan<br />konst och arkitektur.
          </p>
          <FooterLink href="mailto:info@studioslagg.se">info@studioslagg.se</FooterLink>
          <FooterLink href="https://instagram.com">Instagram</FooterLink>
        </FooterCol>

        <FooterCol heading="Navigera">
          <FooterLink href="/">Start</FooterLink>
          <FooterLink href="/verk">Alla verk</FooterLink>
          <FooterLink href="/om">Om studion</FooterLink>
          <FooterLink href="/kontakt">Kontakt</FooterLink>
        </FooterCol>

        <FooterCol heading="Köp & hyra">
          <FooterLink href="/verk?status=till-salu">Till salu</FooterLink>
          <FooterLink href="/verk?status=uthyrning">Uthyrning</FooterLink>
          <FooterLink href="/kontakt">Beställ verk</FooterLink>
          <FooterLink href="/faq">Vanliga frågor</FooterLink>
        </FooterCol>

        <FooterCol heading="Övrigt">
          <FooterLink href="/press">Press</FooterLink>
          <FooterLink href="/integritetspolicy">Integritetspolicy</FooterLink>
          <FooterLink href="/villkor">Köpvillkor</FooterLink>
        </FooterCol>
      </div>

      {/* Tagline */}
      <div
        className="max-w-6xl mx-auto px-6 pb-10"
        style={{ borderTop: "1px solid var(--line)" }}
      >
        <p
          className="pt-6 text-xs uppercase tracking-widest"
          style={{ fontFamily: "var(--font-ui)", color: "var(--dust)" }}
        >
          Skrap. Yta. Rum. — Studio Slagg © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
