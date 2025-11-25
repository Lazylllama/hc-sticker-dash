import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin as adminPlugin, genericOAuth } from "better-auth/plugins";
import { env } from "~/env";
import { db } from "~/server/db";
import { ac, admin, user } from "./permissions";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg", // or "pg" or "mysql"
	}),
	emailAndPassword: {
		enabled: true,
	},
	plugins: [
		genericOAuth({
			config: [
				{
					providerId: "hack-club",
					clientId: env.BETTER_AUTH_HACK_CLUB_CLIENT_ID,
					clientSecret: env.BETTER_AUTH_HACK_CLUB_CLIENT_SECRET,
					authorizationUrl: "https://account.hackclub.com/oauth/authorize",
					tokenUrl: "https://account.hackclub.com/oauth/token",
					redirectURI: "http://localhost:3000/api/auth/callback/hack-club",
					scopes: ["email", "slack_id"],
					getUserInfo: async (tokens) => {
						const response = await fetch(
							"https://account.hackclub.com/api/v1/me",
							{
								headers: {
									Authorization: `Bearer ${tokens.accessToken}`,
								},
							},
						);
						const data = await response.json();
						console.log("Hack Club user data:", data);
						return {
							id: data.identity.id,
							email: data.identity.primary_email,
							emailVerified: true,
							slackId: data.identity.slack_id,
						};
					},
				},
			],
		}),
		adminPlugin({
			ac,
			roles: {
				admin,
				user,
			},
		}),
		nextCookies(),
	],
});

export type Session = typeof auth.$Infer.Session;
