import { relations } from "drizzle-orm";
import {
	index,
	pgTableCreator,
} from "drizzle-orm/pg-core";
import { user } from "./schema";

export const createTable = pgTableCreator((name) => `pg-drizzle_${name}`);

export const stickers = createTable(
	"sticker",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		name: d.varchar({ length: 256 }).notNull(),
		imageUrl: d.text().notNull(),
	}),
	(t) => [index("sticker_name_idx").on(t.name)],
);

export const userStickers = createTable(
	"user_sticker",
	(d) => ({
		userId: d
			.text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		stickerId: d
			.integer()
			.notNull()
			.references(() => stickers.id, { onDelete: "cascade" }),
		quantity: d.integer().notNull().default(1),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("user_sticker_user_idx").on(t.userId),
		index("user_sticker_sticker_idx").on(t.stickerId),
	],
);

export const stickerRelations = relations(stickers, ({ many }) => ({
	userStickers: many(userStickers),
}));

export const userStickerRelations = relations(userStickers, ({ one }) => ({
	user: one(user, { fields: [userStickers.userId], references: [user.id] }),
	sticker: one(stickers, { fields: [userStickers.stickerId], references: [stickers.id] }),
}));