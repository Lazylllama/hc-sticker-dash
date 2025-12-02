import { relations } from "drizzle-orm";
import { boolean, index, pgTableCreator, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `hc-sticker-dash_${name}`);

// STICKERS
export const stickers = createTable(
	"sticker",
	(d) => ({
		id: d.serial("id").primaryKey(),
		name: d.varchar({ length: 256 }).notNull(),
		category: d.varchar({ length: 256 }),
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
		primaryKey({ columns: [t.userId, t.stickerId] }),
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

// AUTH
export const user = createTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	role: text("role"),
	banned: boolean("banned").default(false),
	banReason: text("ban_reason"),
	banExpires: timestamp("ban_expires"),
});

export const session = createTable(
	"session",
	{
		id: text("id").primaryKey(),
		expiresAt: timestamp("expires_at").notNull(),
		token: text("token").notNull().unique(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		impersonatedBy: text("impersonated_by"),
	},
	(table) => [index("session_userId_idx").on(table.userId)],
);

export const account = createTable(
	"account",
	{
		id: text("id").primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at"),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
		scope: text("scope"),
		password: text("password"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = createTable(
	"verification",
	{
		id: text("id").primaryKey(),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);
export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	userStickers: many(userStickers),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));
