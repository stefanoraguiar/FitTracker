type Name = "today" | "program" | "history" | "more";

export function Icon({ name }: { name: Name }) {
  const props = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  if (name === "today") {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4.5L15 15" />
      </svg>
    );
  }
  if (name === "program") {
    return (
      <svg {...props}>
        <rect x="4" y="4" width="6.5" height="6.5" rx="1.4" />
        <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.4" />
        <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.4" />
        <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.4" />
      </svg>
    );
  }
  if (name === "history") {
    return (
      <svg {...props}>
        <path d="M8 6h11M8 12h11M8 18h11" />
        <path d="M4.5 6h.5M4.5 12h.5M4.5 18h.5" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4.5v2.2M12 17.3v2.2M4.5 12h2.2M17.3 12h2.2M6.6 6.6l1.6 1.6M15.8 15.8l1.6 1.6M17.4 6.6l-1.6 1.6M8.2 15.8l-1.6 1.6" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        d="M5 12.5 9.5 17 19 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
