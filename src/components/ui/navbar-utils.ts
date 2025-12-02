export const isExternalLink = (href: string) =>
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#");

export const isRouterLink = (href?: string) => href && !isExternalLink(href);

export const cssVars = (
    baseColor: string,
    pillColor: string,
    hoveredPillTextColor: string,
    resolvedPillTextColor: string
): React.CSSProperties => ({
    "--base": baseColor,
    "--pill-bg": pillColor,
    "--hover-text": hoveredPillTextColor,
    "--pill-text": resolvedPillTextColor,
    "--nav-h": "42px",
    "--logo": "36px",
    "--pill-pad-x": "18px",
    "--pill-gap": "3px",
} as React.CSSProperties);

export const pillStyle: React.CSSProperties = {
    background: "var(--pill-bg, #fff)",
    color: "var(--pill-text, var(--base, #000))",
    paddingLeft: "var(--pill-pad-x)",
    paddingRight: "var(--pill-pad-x)",
};

export const basePillClasses =
    "relative overflow-hidden inline-flex items-center justify-center h-full no-underline rounded-full box-border border-2 font-semibold text-[16px] leading-[0] uppercase tracking-[0.2px] whitespace-nowrap cursor-pointer px-0";
