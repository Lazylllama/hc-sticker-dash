"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SpringOptions } from "motion/react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type z from "zod";
import { stickerFormSchema } from "./sticker-grid";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "./ui/card";
import { Field, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";

interface TiltedCardProps {
    imageSrc: React.ComponentProps<"img">["src"];
    altText?: string;
    onSubmit: (data: { amount: number; stickerId: number }) => boolean;
    stickerName: string;
    stickerId: number;
    stickerAmount: number;
    isAuthenticated: boolean;
}

const springValues: SpringOptions = {
    damping: 30,
    stiffness: 100,
    mass: 2,
};

export default function StickerTile({
    imageSrc,
    altText = "Sticker",
    onSubmit,
    stickerName = "",
    stickerId = 0,
    stickerAmount = 0,
    isAuthenticated,
}: TiltedCardProps) {
    const form = useForm<z.infer<typeof stickerFormSchema>>({
        resolver: zodResolver(stickerFormSchema),
        defaultValues: {
            amount: stickerAmount,
            stickerId,
        },
    });
    //! Motion
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

        const rotationX = (offsetY / (rect.height / 2)) * -14;
        const rotationY = (offsetX / (rect.width / 2)) * 14;

        rotateX.set(rotationX);
        rotateY.set(rotationY);

        x.set(e.clientX - rect.left);
        y.set(e.clientY - rect.top);

        const velocityY = offsetY - lastY;
        rotateFigcaption.set(-velocityY * 0.6);
        setLastY(offsetY);
    }

    function handleMouseEnter() {
        scale.set(1.05);
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
        <Card className="m-2 rounded-lg bg-card p-3 shadow-md transition-all hover:shadow-lg sm:m-4 sm:p-4">
            <CardHeader className="sticker-img p-2 sm:p-4">
                <figure
                    className="relative flex h-full w-full flex-col items-center justify-center [perspective:800px]"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={handleMouse}
                    ref={ref}
                >
                    <motion.div
                        className="relative aspect-square h-full w-full [transform-style:preserve-3d]"
                        style={{
                            rotateX,
                            rotateY,
                            scale,
                        }}
                    >
                        <motion.img
                            alt={altText}
                            className="transform-[translateZ(0)] absolute top-0 left-0 h-full w-full object-contain will-change-transform"
                            src={imageSrc}
                        />
                    </motion.div>
                </figure>
            </CardHeader>
            <CardDescription className="mt-1 px-2 text-center text-base sm:mt-2 sm:text-lg">
                {stickerName}
            </CardDescription>
            {isAuthenticated && (
                <CardContent className="rounded-lg bg-accent p-3 sm:p-6">
                    <form
                        onSubmit={form.handleSubmit((data) => {
                            const payload = {
                                amount: Number(data.amount),
                                stickerId: Number(data.stickerId),
                            };

                            onSubmit(payload);
                        })}
                    >
                        <Controller
                            control={form.control}
                            name={"amount"}
                            render={({ field, fieldState }) => (
                                <>
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={`sticker-amount-${stickerId}`}>
                                            Quantity
                                        </FieldLabel>
                                        <div className="flex flex-row gap-2">
                                            <Input
                                                {...field}
                                                aria-invalid={fieldState.invalid}
                                                autoComplete="off"
                                                id={`sticker-amount-${stickerId}`}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value === "" ? "" : e.target.valueAsNumber,
                                                    )
                                                }
                                                type="number"
                                                value={field.value ?? ""}
                                            />
                                            <Button
                                                className="h-full"
                                                type="submit"
                                                variant={stickerAmount === 0 ? "outline" : "default"}
                                            >
                                                Update
                                            </Button>
                                        </div>
                                        {fieldState.error && (
                                            <p className="pt-1 text-red-600 text-xs">
                                                {fieldState.error.message
                                                    ? fieldState.error.message
                                                    : "Error"}
                                            </p>
                                        )}
                                    </Field>
                                </>
                            )}
                        />
                    </form>
                </CardContent>
            )}
        </Card>
    );
}
