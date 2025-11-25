import z from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { auth } from "~/server/better-auth";
import { stickers } from "~/server/db/schema";

export const stickerRouter = createTRPCRouter({
    getStickers: protectedProcedure.query(async ({ ctx }) => {
        const stickers = await ctx.db.query.stickers.findMany();
        return stickers;
    }),

    getOwnedStickers: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.session.user.id;
        const ownedStickers = await ctx.db.query.userStickers.findMany({
            where: (userStickers, { eq }) => eq(userStickers.userId, userId),
        });
        return ownedStickers;
    }),

    importNewStickersFromJson: protectedProcedure
        .input(z.object({ url: z.string().url() }))
        .mutation(async ({ ctx, input }) => {
            const hasAdminWrite = await auth.api.userHasPermission({
                body: {
                    permission: { admin: ["write"] },
                    userId: ctx.session.user.id,
                },
                headers: ctx.headers,
            });

            if (!hasAdminWrite) {
                throw new Error("Unauthorized");
            }

            const response = await fetch(input.url);
            const stickerData = (await response.json()) as {
                name: string;
                src: string;
            }[];

            for (const sticker of stickerData) {
                const existingSticker = await ctx.db.query.stickers.findFirst({
                    where: (dbSticker, { eq }) =>
                        eq(dbSticker.name, sticker.name),
                });
                if (!existingSticker) {
                    await ctx.db.insert(stickers).values({
                        name: sticker.name,
                        imageUrl: sticker.src,
                    });
                }
            }
        }),

    // setStickerOwned: protectedProcedure
    //     .input(
    //         z.object({
    //             stickerId: z.string().min(1),
    //             owned: z.boolean(),
    //             amount: z.number().min(1).optional(),
    //         }),
    //     )
    //     .mutation(async ({ ctx, input }) => {
    //         const userId = ctx.session.user.id;
    //         const existingEntry = await ctx.db.query.userStickers.findFirst({
    //             where: (userStickers, { and, eq }) =>
    //                 and(
    //                     eq(userStickers.userId, userId),
    //                     eq(userStickers.stickerId, input.stickerId),
    //                 ),
    //         });
    //         if (input.owned) {
    //             if (existingEntry) {
    //                 await ctx.db.update(ctx.db.userStickers).set({
    //                     quantity: existingEntry.quantity + (input.amount ?? 1),
    //                 })
    //                 .where(
    //                     (userStickers, { and, eq }) =>
    //                         and(
    //                             eq(userStickers.userId, userId),
    //                             eq(userStickers.stickerId, input.stickerId),
    //                         ),
    //                 );
    //             } else {
    //                 await ctx.db.insert(ctx.db.userStickers).values({
    //                     userId: userId,
    //                     stickerId: input.stickerId,
    //                     quantity: input.amount ?? 1,
    //                 });
    //             }
    //         } else {
    //             if (existingEntry) {
    //                 await ctx.db.delete(ctx.db.userStickers)
    //                 .where(
    //                     (userStickers, { and, eq }) =>
    //                         and(
    //                             eq(userStickers.userId, userId),
    //                             eq(userStickers.stickerId, input.stickerId),
    //                         ),
    //                 );
    //             }
    //         }
    //     }),
});
