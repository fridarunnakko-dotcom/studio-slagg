import { type Work } from "@/data/works";

function StatusTag({ status }: { status: Work["status"] }) {
  if (status.type === "sold") {
    return (
      <span
        className="text-xs uppercase tracking-widest px-2 py-1"
        style={{
          fontFamily: "var(--font-ui)",
          color: "var(--dust)",
          background: "var(--concrete)",
          borderRadius: 2,
        }}
      >
        Såld
      </span>
    );
  }

  if (status.type === "rent_only") {
    return (
      <span
        className="text-xs uppercase tracking-widest px-2 py-1"
        style={{
          fontFamily: "var(--font-ui)",
          color: "var(--paper)",
          background: "var(--lin)",
          borderRadius: 2,
        }}
      >
        Uthyrning
      </span>
    );
  }

  return (
    <span
      className="text-xs uppercase tracking-widest px-2 py-1"
      style={{
        fontFamily: "var(--font-ui)",
        color: "var(--ink)",
        background: "var(--concrete)",
        borderRadius: 2,
      }}
    >
      Till salu
    </span>
  );
}

function formatPrice(n: number) {
  return n.toLocaleString("sv-SE") + " kr";
}

export function WorkCard({ work }: { work: Work }) {
  const { title, medium, dimensions, year, status, image } = work;

  return (
    <article className="flex flex-col gap-3">
      {/* Image */}
      <div
        className="w-full aspect-[4/5] relative overflow-hidden"
        style={{ background: "var(--concrete)" }}
      >
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1">
        <h3
          className="text-sm font-normal"
          style={{ fontFamily: "var(--font-body)", color: "var(--ink)" }}
        >
          {title}
        </h3>
        <p
          className="text-xs leading-relaxed"
          style={{ fontFamily: "var(--font-ui)", color: "var(--void)" }}
        >
          {medium}
          <br />
          {dimensions}, {year}
        </p>
      </div>

      {/* Price + status */}
      <div className="flex items-center justify-between gap-2 mt-auto">
        <div className="flex flex-col">
          {(status.type === "for_sale" || status.type === "for_sale_rent") && (
            <span
              className="text-sm"
              style={{ fontFamily: "var(--font-body)", color: "var(--ink)" }}
            >
              {formatPrice(status.price)}
            </span>
          )}
          {(status.type === "for_sale_rent" || status.type === "rent_only") && (
            <span
              className="text-xs"
              style={{ fontFamily: "var(--font-ui)", color: "var(--lin)" }}
            >
              Hyra {formatPrice(status.rentPrice)}/mån
            </span>
          )}
        </div>
        <StatusTag status={status} />
      </div>
    </article>
  );
}
