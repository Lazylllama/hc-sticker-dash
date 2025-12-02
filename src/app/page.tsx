import { headers } from "next/headers";
import { redirect } from "next/navigation";
import LandingBackground from "~/components/landing-background";
import { SiteNavbar } from "~/components/navbar";

import { auth } from "~/server/better-auth";
import { getSession } from "~/server/better-auth/server";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
	const session = await getSession();
	return (
		<HydrateClient>
			<div className="relative w-full">
				<LandingBackground />
			</div>
		</HydrateClient>
	);
}
