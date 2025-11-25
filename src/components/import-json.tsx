'use client'

import { api } from "~/trpc/react";

export default function ImportJson() {
    const importStickers = api.stickers.importNewStickersFromJson.useMutation();

    return (
        <button
            onClick={async () => {
                await importStickers.mutateAsync({
                    url: (document.getElementById(
                        "stickerJsonUrl",
                    ) as HTMLInputElement).value,
                });
                alert("Complete!");
            }}
            type="submit"
        >
            Import new stickers from JSON
        </button>
    )
}