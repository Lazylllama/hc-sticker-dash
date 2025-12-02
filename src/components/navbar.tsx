"use client";

import { createAuthClient } from "better-auth/react";
import { redirect } from "next/navigation";
import { authClient } from "~/server/better-auth/client";
import PillNav from "./ui/navbar";

const { useSession } = createAuthClient();

export function SiteNavbar() {
    const {
        data: session,
        isPending, //loading state
    } = useSession();

    return (
        <PillNav
            isAuthenticated={!!session}
            isPending={isPending}
            items={[
                { label: "Home", href: "/" },
                { label: "Stickers", href: "/stickers" },
            ]}
            logo="https://icons.hackclub.com/api/icons/red/sticker"
            onSignIn={async () => {
                const res = await authClient.signIn.oauth2({
                    providerId: "hack-club",
                    callbackURL: "/",
                });
                if (res.data?.url) {
                    window.location.href = res.data.url;
                }
            }}
            onSignOut={async () => {
                const res = await authClient.signOut();

                if (res.data?.success) {
                    redirect("/");
                }
            }}
        />
    );
}
