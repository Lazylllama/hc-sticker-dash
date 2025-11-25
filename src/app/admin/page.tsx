import { redirect } from "next/navigation";
import ImportJson from "~/components/import-json";
import { auth } from "~/server/better-auth";
import { getSession } from "~/server/better-auth/server";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
    const session = await getSession();

    if (!session) {
        redirect("/");
    }

    const canReadAdmin = await auth.api.userHasPermission({
        body: {
            permission: { admin: ["read"] },
            userId: session.user?.id,
        },
    });

    if (!canReadAdmin) {
        redirect("/");
    }

    return (
        <HydrateClient>
            Hello {session.user?.name}!<div>Admin Panel</div>
            <div>
                <h1>Import new stickers from JSON:</h1>
                <input
                    defaultValue="https://example.com/stickers.json"
                    id="stickerJsonUrl"
                    type="text"
                />
                <ImportJson />
            </div>
        </HydrateClient>
    );
}
