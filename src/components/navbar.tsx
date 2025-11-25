'use client'

import { redirect } from "next/navigation";
import { useState } from "react";
import {
    MobileNav,
    MobileNavHeader,
    MobileNavMenu,
    MobileNavToggle,
    NavBody,
    Navbar,
    NavbarButton,
    NavbarLogo,
    NavItems,
} from "~/components/ui/resizable-navbar";
import { authClient } from "~/server/better-auth/client";

export function SiteNavbar() {
    const navItems = [
        {
            name: "Stickers",
            link: "/stickers",
        }
    ];

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <Navbar>
            {/* Desktop Navigation */}
            <NavBody>
                <NavbarLogo />
                <NavItems items={navItems} />
                <div className="flex items-center gap-4">
                    <NavbarButton className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
                        formAction={async () => {
                            const res = await authClient.signIn.oauth2({
                                providerId: "hack-club",
                                callbackURL: "/",

                            });
                            if (!res.data?.url) {
                                throw new Error("No URL returned from signInSocial");
                            }
                            redirect(res.data.url);
                        }}
                        type="submit" variant="primary">Login with Hack Club</NavbarButton>
                </div>
            </NavBody>

            {/* Mobile Navigation */}
            <MobileNav>
                <MobileNavHeader>
                    <NavbarLogo />
                    <MobileNavToggle
                        isOpen={isMobileMenuOpen}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    />
                </MobileNavHeader>

                <MobileNavMenu
                    isOpen={isMobileMenuOpen}
                    onClose={() => setIsMobileMenuOpen(false)}
                >
                    {navItems.map((item, idx) => (
                        <a
                            className="relative text-neutral-600 dark:text-neutral-300"
                            href={item.link}
                            key={`mobile-link-${idx + 0}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <span className="block">{item.name}</span>
                        </a>
                    ))}
                    <div className="flex w-full flex-col gap-4">
                        <NavbarButton
                            className="w-full"
                            onClick={() => setIsMobileMenuOpen(false)}
                            variant="primary"
                        >
                            Login
                        </NavbarButton>
                        <NavbarButton
                            className="w-full"
                            onClick={() => setIsMobileMenuOpen(false)}
                            variant="primary"
                        >
                            Book a call
                        </NavbarButton>
                    </div>
                </MobileNavMenu>
            </MobileNav>
        </Navbar>
    );
}
