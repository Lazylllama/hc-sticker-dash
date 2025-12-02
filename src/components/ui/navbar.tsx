"use client";

import { gsap } from "gsap";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  basePillClasses,
  cssVars,
  isRouterLink,
  pillStyle,
} from "./navbar-utils";

export type PillNavItem = {
  label: string;
  href: string;
  ariaLabel?: string;
};

export interface PillNavProps {
  logo: string;
  logoAlt?: string;
  items: PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  borderColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  onMobileMenuClick?: () => void;
  initialLoadAnimation?: boolean;
  isPending: boolean;
  isAuthenticated?: boolean;
  onSignIn?: () => Promise<void>;
  onSignOut?: () => Promise<void>;
}

const PillNav: React.FC<PillNavProps> = ({
  logo,
  logoAlt = "Logo",
  items,
  activeHref,
  className = "",
  ease = "power3.easeOut",
  baseColor = "var(--card)",
  borderColor = "var(--card-border)",
  pillColor = "#fff",
  hoveredPillTextColor = "#fff",
  pillTextColor,
  onMobileMenuClick,
  initialLoadAnimation = true,
  isPending = true,
  isAuthenticated = false,
  onSignIn,
  onSignOut,
}) => {
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Refs
  const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([]);
  const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([]);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const logoTweenRef = useRef<gsap.core.Tween | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLAnchorElement | HTMLElement | null>(null);
  const authButtonCircleRef = useRef<HTMLSpanElement | null>(null);
  const authButtonTlRef = useRef<gsap.core.Timeline | null>(null);
  const authButtonActiveTweenRef = useRef<gsap.core.Tween | null>(null);

  // Helper: build hover timeline for a pill circle + labels
  const buildPillTimeline = useCallback(
    (circleEl: HTMLSpanElement): gsap.core.Timeline | null => {
      const pill = circleEl.parentElement as HTMLElement | null;
      if (!pill) return null;

      const rect = pill.getBoundingClientRect();
      const { width: w, height: h } = rect;
      const R = ((w * w) / 4 + h * h) / (2 * h);
      const D = Math.ceil(2 * R) + 2;
      const delta =
        Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
      const originY = D - delta;

      circleEl.style.width = `${D}px`;
      circleEl.style.height = `${D}px`;
      circleEl.style.bottom = `-${delta}px`;

      gsap.set(circleEl, {
        xPercent: -50,
        scale: 0,
        transformOrigin: `50% ${originY}px`,
      });

      const label = pill.querySelector<HTMLElement>(".pill-label");
      const white = pill.querySelector<HTMLElement>(".pill-label-hover");

      if (label) gsap.set(label, { y: 0 });
      if (white) gsap.set(white, { y: h + 12, opacity: 0 });

      const tl = gsap.timeline({ paused: true });

      tl.to(
        circleEl,
        { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: "auto" },
        0,
      );

      if (label) {
        tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: "auto" }, 0);
      }

      if (white) {
        gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
        tl.to(
          white,
          { y: 0, opacity: 1, duration: 2, ease, overwrite: "auto" },
          0,
        );
      }

      return tl;
    },
    [ease],
  );

  useLayoutEffect(() => {
    // Clean up any existing timelines before re-layout
    tlRefs.current.forEach((tl) => {
      if (tl) {
        tl.kill();
      }
    });
    authButtonTlRef.current?.kill();

    const layout = () => {
      // Sync arrays to items length
      tlRefs.current.length = items.length;
      activeTweenRefs.current.length = items.length;

      // Layout nav item pills
      circleRefs.current.forEach((circle, index) => {
        if (!circle) return;
        tlRefs.current[index]?.kill();
        const tl = buildPillTimeline(circle);
        tlRefs.current[index] = tl ?? null;
      });

      // Layout auth button
      const authCircle = authButtonCircleRef.current;
      if (authCircle) {
        authButtonTlRef.current?.kill();
        authButtonTlRef.current = buildPillTimeline(authCircle);
      }
    };

    layout();

    // Resize with rAF throttle
    let raf = 0;
    const onResize = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(layout);
    };
    window.addEventListener("resize", onResize);

    if (document.fonts) {
      document.fonts.ready.then(layout).catch(() => { });
    }

    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: "hidden", opacity: 0, scaleY: 1, y: 0 });
    }

    if (initialLoadAnimation) {
      const logoEl = logoRef.current;
      const navItems = navItemsRef.current;

      if (logoEl) {
        gsap.set(logoEl, { scale: 0 });
        gsap.to(logoEl, {
          scale: 1,
          duration: 0.6,
          ease,
        });
      }

      if (navItems) {
        gsap.set(navItems, { width: 0, overflow: "hidden" });
        gsap.to(navItems, {
          width: "auto",
          duration: 0.6,
          ease,
        });
      }
    }

    return () => {
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items, ease, initialLoadAnimation, buildPillTimeline]);

  const handleMouse = useCallback(
    (i: number, isEnter: boolean) => {
      const tl = tlRefs.current[i];
      if (!tl) return;
      activeTweenRefs.current[i]?.kill();
      activeTweenRefs.current[i] = tl.tweenTo(isEnter ? tl.duration() : 0, {
        duration: isEnter ? 0.3 : 0.2,
        ease,
        overwrite: "auto",
      });
    },
    [ease],
  );

  const handleAuthButtonEnter = useCallback(() => {
    const tl = authButtonTlRef.current;
    if (!tl) return;
    authButtonActiveTweenRef.current?.kill();
    authButtonActiveTweenRef.current = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: "auto",
    });
  }, [ease]);

  const handleAuthButtonLeave = useCallback(() => {
    const tl = authButtonTlRef.current;
    if (!tl) return;
    authButtonActiveTweenRef.current?.kill();
    authButtonActiveTweenRef.current = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: "auto",
    });
  }, [ease]);

  const handleLogoEnter = useCallback(() => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    gsap.set(img, { rotate: 0 });
    logoTweenRef.current = gsap.to(img, {
      rotate: 360,
      duration: 0.2,
      ease,
      overwrite: "auto",
    });
  }, [ease]);

  const toggleMobileMenu = useCallback(() => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll(".hamburger-line");
      if (newState) {
        if (lines[0])
          gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
        if (lines[1])
          gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
      } else {
        if (lines[0])
          gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
        if (lines[1])
          gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: "visible" });
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10, scaleY: 1 },
          {
            opacity: 1,
            y: 0,
            scaleY: 1,
            duration: 0.3,
            ease,
            transformOrigin: "top center",
          },
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          scaleY: 1,
          duration: 0.2,
          ease,
          transformOrigin: "top center",
          onComplete: () => {
            gsap.set(menu, { visibility: "hidden" });
          },
        });
      }
    }

    onMobileMenuClick?.();
  }, [ease, isMobileMenuOpen, onMobileMenuClick]);

  const mobileHoverIn = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.currentTarget.style.background = "var(--base)";
      e.currentTarget.style.color = "var(--hover-text, #fff)";
    },
    [],
  );
  const mobileHoverOut = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.currentTarget.style.background = "var(--pill-bg, #fff)";
      e.currentTarget.style.color = "var(--pill-text, #fff)";
    },
    [],
  );

  const AuthButton = (
    <button
      aria-label={isAuthenticated ? "Sign out" : "Sign in"}
      className={basePillClasses}
      disabled={isPending}
      onClick={isAuthenticated ? onSignOut : onSignIn}
      onMouseEnter={handleAuthButtonEnter}
      onMouseLeave={handleAuthButtonLeave}
      style={pillStyle}
      type="button"
    >
      <span
        aria-hidden="true"
        className="hover-circle pointer-events-none absolute bottom-0 left-1/2 z-1 block rounded-full"
        ref={authButtonCircleRef}
        style={{
          background: "var(--base, #000)",
          willChange: "transform",
        }}
      />
      <span className="label-stack relative z-1 inline-block leading-1">
        <span
          className="pill-label relative z-1 inline-block leading-1"
          style={{ willChange: "transform" }}
        >
          {isPending ? "..." : isAuthenticated ? "Sign Out" : "Sign In"}
        </span>
        <span
          aria-hidden="true"
          className="pill-label-hover absolute top-0 left-0 z-1 inline-block"
          style={{
            color: "var(--hover-text, #fff)",
            willChange: "transform, opacity",
          }}
        >
          {isPending ? "..." : isAuthenticated ? "Sign Out" : "Sign In"}
        </span>
      </span>
    </button>
  );

  const LogoEl = (
    <Image
      alt={logoAlt}
      className="block h-full w-full object-cover"
      height={36}
      ref={logoImgRef}
      src={logo}
      unoptimized
      width={36}
    />
  );

  return (
    <div className="absolute top-[1em] left-0 z-1000 w-full md:left-auto md:w-auto">
      <nav
        aria-label="Primary"
        className={`box-border flex w-full items-center justify-between px-4 md:w-max md:justify-start md:px-0 ${className}`}
        style={cssVars(
          baseColor,
          pillColor,
          hoveredPillTextColor,
          resolvedPillTextColor,
        )}
      >
        {isRouterLink(items?.[0]?.href) ? (
          <Link
            aria-label="Home"
            className="inline-flex items-center justify-center overflow-hidden rounded-full p-2"
            href={items?.[0]?.href || "/"}
            onMouseEnter={handleLogoEnter}
            ref={(el) => {
              logoRef.current = el;
            }}
            role="menuitem"
            style={{
              width: "var(--nav-h)",
              height: "var(--nav-h)",
              background: "var(--base, #000)",
            }}
          >
            {LogoEl}
          </Link>
        ) : (
          <a
            aria-label="Home"
            className="inline-flex items-center justify-center overflow-hidden rounded-full p-2"
            href={items?.[0]?.href || "#"}
            onMouseEnter={handleLogoEnter}
            ref={(el) => {
              logoRef.current = el;
            }}
            style={{
              width: "var(--nav-h)",
            }}
            title={logoAlt}
          >
            {LogoEl}
          </a>
        )}

        <div
          className="relative ml-2 hidden items-center rounded-full border-1 md:flex"
          ref={navItemsRef}
          style={{
            height: "var(--nav-h)",
            background: "var(--base, #000)",
          }}
        >
          <ul
            className="m-0 flex h-full list-none items-stretch p-[3px]"
            style={{ gap: "var(--pill-gap)" }}
          >
            {items.map((item, i) => {
              const isActive = activeHref === item.href;

              const PillContent = (
                <>
                  <span
                    aria-hidden="true"
                    className="hover-circle pointer-events-none absolute bottom-0 left-1/2 z-1 block rounded-full"
                    ref={(el) => {
                      circleRefs.current[i] = el;
                    }}
                    style={{
                      background: "var(--base, #000)",
                      willChange: "transform",
                    }}
                  />
                  <span className="label-stack relative z-1 inline-block leading-1">
                    <span
                      className="pill-label relative z-1 inline-block leading-1"
                      style={{ willChange: "transform" }}
                    >
                      {item.label}
                    </span>
                    <span
                      aria-hidden="true"
                      className="pill-label-hover absolute top-0 left-0 z-1 inline-block"
                      style={{
                        color: "var(--hover-text, #fff)",
                        willChange: "transform, opacity",
                      }}
                    >
                      {item.label}
                    </span>
                  </span>
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="-bottom-1.5 -translate-x-1/2 absolute left-1/2 z-4 h-3 w-3 rounded-full"
                      style={{ background: "var(--base, #000)" }}
                    />
                  )}
                </>
              );

              return (
                <li className="flex h-full" key={item.href} role="none">
                  {isRouterLink(item.href) ? (
                    <Link
                      aria-label={item.ariaLabel || item.label}
                      className={basePillClasses}
                      href={item.href}
                      onMouseEnter={() => handleMouse(i, true)}
                      onMouseLeave={() => handleMouse(i, false)}
                      role="menuitem"
                      style={pillStyle}
                    >
                      {PillContent}
                    </Link>
                  ) : (
                    <a
                      aria-label={item.ariaLabel || item.label}
                      className={basePillClasses}
                      href={item.href}
                      onMouseEnter={() => handleMouse(i, true)}
                      onMouseLeave={() => handleMouse(i, false)}
                      role="menuitem"
                      style={pillStyle}
                    >
                      {PillContent}
                    </a>
                  )}
                </li>
              );
            })}
            <li className="flex h-full" role="none">
              {AuthButton}
            </li>
          </ul>
        </div>

        <button
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle menu"
          className="relative flex cursor-pointer flex-col items-center justify-center gap-1 rounded-full border-0 p-0 md:hidden"
          onClick={toggleMobileMenu}
          ref={hamburgerRef}
          style={{
            width: "var(--nav-h)",
            height: "var(--nav-h)",
            background: "var(--base, #000)",
          }}
          type="button"
        >
          <span
            className="hamburger-line h-0.5 w-4 origin-center rounded transition-all duration-10 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
            style={{ background: "var(--pill-bg, #fff)" }}
          />
          <span
            className="hamburger-line h-0.5 w-4 origin-center rounded transition-all duration-10 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
            style={{ background: "var(--pill-bg, #fff)" }}
          />
        </button>
      </nav>

      <div
        className="absolute top-[3em] right-4 left-4 z-998 origin-top rounded-[27px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] md:hidden"
        ref={mobileMenuRef}
        style={{
          ...cssVars(
            baseColor,
            pillColor,
            hoveredPillTextColor,
            resolvedPillTextColor,
          ),
          background: "var(--base, #f0f0f0)",
        }}
      >
        <ul className="m-0 flex list-none flex-col gap-[3px] p-[3px]">
          {items.map((item) => {
            const defaultStyle: React.CSSProperties = {
              background: "var(--pill-bg, #fff)",
              color: "var(--pill-text, #fff)",
            };

            const linkClasses =
              "block py-3 px-4 text-[16px] font-medium rounded-[50px] transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]";

            return (
              <li key={item.href}>
                {isRouterLink(item.href) ? (
                  <Link
                    className={linkClasses}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    onMouseEnter={mobileHoverIn}
                    onMouseLeave={mobileHoverOut}
                    style={defaultStyle}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    className={linkClasses}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    onMouseEnter={mobileHoverIn}
                    onMouseLeave={mobileHoverOut}
                    style={defaultStyle}
                  >
                    {item.label}
                  </a>
                )}
              </li>
            );
          })}
          <li>
            <button
              className="block w-full rounded-[50px] px-4 py-3 text-left font-medium text-[16px] transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
              onClick={async () => {
                setIsMobileMenuOpen(false);
                if (isAuthenticated) {
                  await onSignOut?.();
                } else {
                  await onSignIn?.();
                }
              }}
              style={{
                background: "var(--pill-bg, #fff)",
                color: "var(--pill-text, #fff)",
              }}
              type="button"
            >
              {isAuthenticated ? "Sign Out" : "Sign In"}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PillNav;
