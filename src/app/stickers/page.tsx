import { redirect } from "next/navigation";
import StickerGrid from "~/components/sticker-grid";
import { getSession } from "~/server/better-auth/server";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
    const session = await getSession();
    const stickers = await api.stickers.getStickers();

    if (!session) {
        redirect("/");
    }

    return (
        <HydrateClient>
            Hello {session.user?.name}!
            <StickerGrid stickers={stickers} />
        </HydrateClient>
    );
}
