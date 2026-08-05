export function DecorativeGrid() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in oklch, var(--border) 60%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklch, var(--border) 60%, transparent) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}

export function AmbientGlow() {
  return (
    <div
      className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,color-mix(in_oklch,var(--primary)_5%,transparent),transparent_45%)]"
      aria-hidden
    />
  );
}
