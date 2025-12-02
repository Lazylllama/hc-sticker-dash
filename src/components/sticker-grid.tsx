"use client";

import { useMemo, useState } from "react";
import type { OwnedStickers, Stickers } from "types/trpc";
import z from "zod";
import { api } from "~/trpc/react";
import StickerTile from "./sticker";
import { Input } from "./ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";

export const stickerFormSchema = z.object({
    amount: z.number().min(0),
    stickerId: z.number().min(1),
});

type SortMode = "name-az" | "name-za" | "quantity-hl" | "quantity-lh";
export default function StickerGrid({
    isAuthenticated,
    stickers,
    ownedStickers,
}: {
    isAuthenticated: boolean;
    stickers: Stickers;
    ownedStickers: OwnedStickers;
}) {
    const setOwned = api.stickers.setStickerOwned.useMutation();
    const [sortMode, setSortMode] = useState<SortMode>("quantity-hl");
    const [searchTerm, setSearchTerm] = useState("");

    function onSubmit(data: z.infer<typeof stickerFormSchema>) {
        setOwned.mutate({
            stickerId: data.stickerId,
            newState: !!data.amount,
            amount: data.amount,
        });
        return true;
    }

    const quantityMap = useMemo(
        () => new Map(ownedStickers.map((o) => [o.stickerId, o.quantity])),
        [ownedStickers],
    );

    const sortedStickers = useMemo(() => {
        const arr = [...stickers];

        // Filter
        arr.filter((sticker) =>
            sticker.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );

        // Sort
        arr.sort((a, b) => {
            if (sortMode === "name-az" || sortMode === "name-za") {
                return a.name.localeCompare(b.name) * (sortMode === "name-az" ? 1 : -1);
            }

            if (sortMode === "quantity-hl" || sortMode === "quantity-lh") {
                const qa = quantityMap.get(a.id) ?? 0;
                const qb = quantityMap.get(b.id) ?? 0;

                const dir = sortMode === "quantity-hl" ? -1 : 1; // -1 for high→low, 1 for low→high
                return (qa - qb) * dir;
            }

            return 0;
        });
        return arr;
    }, [stickers, sortMode, quantityMap, searchTerm]);

    return (
        <div className="space-y-4 p-4">
            <div className="flex w-full flex-row items-center justify-between gap-4 p-4">
                <Input
                    className="w-64"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search stickers..."
                    type="search"
                    value={searchTerm}
                />
                <Select
                    onValueChange={(e) => setSortMode(e as SortMode)}
                    value={sortMode}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select a sort mode" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="quantity-hl">Quantity High to Low</SelectItem>
                        <SelectItem value="quantity-lh">Quantity Low to High</SelectItem>
                        <SelectItem value="name-az">Name A-Z</SelectItem>
                        <SelectItem value="name-za">Name Z-A</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {sortedStickers.map((sticker) => (
                    <div key={sticker.id}>
                        <StickerTile
                            altText={sticker.name}
                            imageSrc={sticker.imageUrl}
                            isAuthenticated={isAuthenticated}
                            onSubmit={onSubmit}
                            stickerAmount={quantityMap.get(sticker.id) || 0}
                            stickerId={sticker.id}
                            stickerName={sticker.name}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
