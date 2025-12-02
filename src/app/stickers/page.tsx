import type { OwnedStickers } from "types/trpc";
import { SiteNavbar } from "~/components/navbar";
import StickerGrid from "~/components/sticker-grid";
import { getSession } from "~/server/better-auth/server";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
    var ownedStickers: OwnedStickers = [];
    const session = await getSession();
    const stickers = await api.stickers.getStickers();

    if (session) {
        ownedStickers = await api.stickers.getOwnedStickers();
    }

    return (
        <HydrateClient>
            <StickerGrid
                isAuthenticated={!!session}
                ownedStickers={ownedStickers}
                stickers={stickers}
            />
        </HydrateClient>
    );
}
