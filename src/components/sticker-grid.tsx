import type { Stickers } from "types/trpc";
import StickerTile from "./sticker";

export default function StickerGrid({ stickers }: { stickers: Stickers }) {
    console.log(stickers);
    return (
        <div className="grid grid-cols-4">
            {stickers?.map((sticker) => (
                <div key={sticker.id}>
                    <h2>{sticker.name}</h2>
                    <StickerTile
                        altText={sticker.name}
                        imageSrc={sticker.imageUrl}
                    />
                </div>
            ))}
        </div>
    );
}
