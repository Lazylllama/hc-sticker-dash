/** biome-ignore-all lint/suspicious/noArrayIndexKey: dont care */
"use client";

import { gsap } from "gsap";
import Image from "next/image";
import { type FC, type ReactNode, useEffect, useRef } from "react";

import stupidStickers from "~/components/stickers.json";

interface GridMotionProps {
    items?: (string | ReactNode)[];
    gradientColor?: string;
}

const GridMotion: FC<GridMotionProps> = ({
    items = [],
    gradientColor = "black",
}) => {
    const gridRef = useRef<HTMLDivElement>(null);
    const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
    const mouseXRef = useRef<number>(0);

    const totalItems = 60;
    const defaultItems = Array.from(
        { length: totalItems },
        (_, index) => `Item ${index + 1}`,
    );
    const combinedItems =
        items.length > 0 ? items.slice(0, totalItems) : defaultItems;

    useEffect(() => {
        gsap.ticker.lagSmoothing(0);
        mouseXRef.current = window.innerWidth / 2;

        const handleMouseMove = (e: MouseEvent): void => {
            mouseXRef.current = e.clientX;
        };

        const updateMotion = (): void => {
            const maxMoveAmount = 300;
            const baseDuration = 0.8;
            const inertiaFactors = [0.6, 0.4, 0.3, 0.2];

            rowRefs.current.forEach((row, index) => {
                if (row) {
                    const direction = index % 2 === 0 ? 1 : -1;
                    const moveAmount =
                        ((mouseXRef.current / window.innerWidth) * maxMoveAmount -
                            maxMoveAmount / 2) *
                        direction;

                    gsap.to(row, {
                        x: moveAmount,
                        duration:
                            baseDuration +
                            (inertiaFactors[index % inertiaFactors.length] ?? 0),
                        ease: "power3.out",
                        overwrite: "auto",
                    });
                }
            });
        };

        const removeAnimationLoop = gsap.ticker.add(updateMotion);
        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            removeAnimationLoop();
        };
    }, []);

    return (
        <div
            className="-z-10 fixed top-0 left-0 h-full w-full overflow-hidden"
            ref={gridRef}
        >
            <section
                className="relative flex h-screen w-full items-center justify-center overflow-hidden"
                style={{
                    background: `radial-gradient(circle, ${gradientColor} 0%, transparent 100%)`,
                }}
            >
                <div className="pointer-events-none absolute inset-0 z-4 bg-size-[250px]"></div>
                <div className="relative z-2 grid h-[150vh] w-[150vw] flex-none origin-center rotate-[-15deg] grid-cols-1 grid-rows-6 gap-4">
                    {Array.from({ length: 6 }, (_, rowIndex) => (
                        <div
                            className="grid grid-cols-10 gap-4"
                            key={rowIndex}
                            ref={(el) => {
                                if (el) rowRefs.current[rowIndex] = el;
                            }}
                            style={{ willChange: "transform, filter" }}
                        >
                            {Array.from({ length: 10 }, (_, itemIndex) => {
                                const content = combinedItems[rowIndex * 10 + itemIndex];
                                return (
                                    <div className="relative" key={itemIndex}>
                                        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[10px] bg-[#111] text-[1.5rem] text-white">
                                            {typeof content === "string" &&
                                                content.startsWith("http") ? (
                                                <Image
                                                    alt=""
                                                    className="absolute inset-0 h-full w-full object-contain"
                                                    height={300}
                                                    src={content}
                                                    style={{ pointerEvents: "none" }}
                                                    width={300}
                                                />
                                            ) : (
                                                <div className="z-1 p-4 text-center">{content}</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="pointer-events-none relative top-0 left-0 h-full w-full"></div>
            </section>
        </div>
    );
};

export default function LandingBackground() {
    const items: string[] = [];

    while (items.length < 60) {
        for (const sticker of stupidStickers) {
            items.push(sticker.src);
            if (items.length >= 60) break;
        }
    }

    return <GridMotion items={items} />;
}
