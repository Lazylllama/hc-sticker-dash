"use client";

import type { SpringOptions } from "motion/react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useRef, useState } from "react";

interface TiltedCardProps {
    imageSrc: React.ComponentProps<"img">["src"];
    altText?: string;
    captionText?: string;
    containerHeight?: React.CSSProperties["height"];
    containerWidth?: React.CSSProperties["width"];
    imageHeight?: React.CSSProperties["height"];
    imageWidth?: React.CSSProperties["width"];
    scaleOnHover?: number;
    rotateAmplitude?: number;
    showMobileWarning?: boolean;
    showTooltip?: boolean;
    overlayContent?: React.ReactNode;
    displayOverlayContent?: boolean;
}

const springValues: SpringOptions = {
    damping: 30,
    stiffness: 100,
    mass: 2,
};

export default function StickerTile({
    imageSrc,
    altText = "Sticker",
    captionText = "",
    containerHeight = "300px",
    containerWidth = "100%",
    scaleOnHover = 1.1,
    rotateAmplitude = 14,
    showMobileWarning = true,
    showTooltip = false,
    overlayContent = null,
    displayOverlayContent = false,
}: TiltedCardProps) {
    const ref = useRef<HTMLElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useSpring(useMotionValue(0), springValues);
    const rotateY = useSpring(useMotionValue(0), springValues);
    const scale = useSpring(1, springValues);
    const opacity = useSpring(0);
    const rotateFigcaption = useSpring(0, {
        stiffness: 350,
        damping: 30,
        mass: 1,
    });

    const [lastY, setLastY] = useState(0);

    function handleMouse(e: React.MouseEvent<HTMLElement>) {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const offsetX = e.clientX - rect.left - rect.width / 2;
        const offsetY = e.clientY - rect.top - rect.height / 2;

        const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
        const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

        rotateX.set(rotationX);
        rotateY.set(rotationY);

        x.set(e.clientX - rect.left);
        y.set(e.clientY - rect.top);

        const velocityY = offsetY - lastY;
        rotateFigcaption.set(-velocityY * 0.6);
        setLastY(offsetY);
    }

    function handleMouseEnter() {
        scale.set(scaleOnHover);
        opacity.set(1);
    }

    function handleMouseLeave() {
        opacity.set(0);
        scale.set(1);
        rotateX.set(0);
        rotateY.set(0);
        rotateFigcaption.set(0);
    }

    return (
        <div className="bg-card">
            <figure
                className="relative flex h-full w-full flex-col items-center justify-center [perspective:800px]"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouse}
                ref={ref}
                style={{
                    height: containerHeight,
                    width: containerWidth,
                }}
            >
                {showMobileWarning && (
                    <div className="absolute top-4 block text-center text-sm sm:hidden">
                        This effect is not optimized for mobile. Check on desktop.
                    </div>
                )}

                <motion.div
                    className="relative aspect-square size-64 [transform-style:preserve-3d]"
                    style={{
                        rotateX,
                        rotateY,
                        scale,
                    }}
                >
                    <motion.img
                        alt={altText}
                        className="absolute top-0 left-0 h-full w-full rounded-[15px] object-contain will-change-transform [transform:translateZ(0)]"
                        src={imageSrc}
                    />

                    {displayOverlayContent && overlayContent && (
                        <motion.div className="absolute top-0 left-0 z-[2] will-change-transform [transform:translateZ(30px)]">
                            {overlayContent}
                        </motion.div>
                    )}
                </motion.div>

                {showTooltip && (
                    <motion.figcaption
                        className="pointer-events-none absolute top-0 left-0 z-[3] hidden rounded-[4px] bg-white px-[10px] py-[4px] text-[#2d2d2d] text-[10px] opacity-0 sm:block"
                        style={{
                            x,
                            y,
                            opacity,
                            rotate: rotateFigcaption,
                        }}
                    >
                        {captionText}
                    </motion.figcaption>
                )}
            </figure>
        </div>
    );
}
