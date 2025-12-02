CREATE TABLE "hc-sticker-dash_account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hc-sticker-dash_session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "hc-sticker-dash_session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "hc-sticker-dash_sticker" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"category" varchar(256),
	"imageUrl" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hc-sticker-dash_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "hc-sticker-dash_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "hc-sticker-dash_user_sticker" (
	"userId" text NOT NULL,
	"stickerId" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone,
	CONSTRAINT "hc-sticker-dash_user_sticker_userId_stickerId_pk" PRIMARY KEY("userId","stickerId")
);
--> statement-breakpoint
CREATE TABLE "hc-sticker-dash_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hc-sticker-dash_account" ADD CONSTRAINT "hc-sticker-dash_account_user_id_hc-sticker-dash_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."hc-sticker-dash_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hc-sticker-dash_session" ADD CONSTRAINT "hc-sticker-dash_session_user_id_hc-sticker-dash_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."hc-sticker-dash_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hc-sticker-dash_user_sticker" ADD CONSTRAINT "hc-sticker-dash_user_sticker_userId_hc-sticker-dash_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."hc-sticker-dash_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hc-sticker-dash_user_sticker" ADD CONSTRAINT "hc-sticker-dash_user_sticker_stickerId_hc-sticker-dash_sticker_id_fk" FOREIGN KEY ("stickerId") REFERENCES "public"."hc-sticker-dash_sticker"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "hc-sticker-dash_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "hc-sticker-dash_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sticker_name_idx" ON "hc-sticker-dash_sticker" USING btree ("name");--> statement-breakpoint
CREATE INDEX "user_sticker_user_idx" ON "hc-sticker-dash_user_sticker" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "user_sticker_sticker_idx" ON "hc-sticker-dash_user_sticker" USING btree ("stickerId");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "hc-sticker-dash_verification" USING btree ("identifier");