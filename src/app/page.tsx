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
				<SiteNavbar />
				<div className="flex flex-col items-center gap-2">
					<div className="flex flex-col items-center justify-center gap-4">
						<p className="text-center text-2xl text-white">
							{session && <span>Logged in as {session.user?.name}</span>}
						</p>
						{!session ? (
							<form>

							</form>
						) : (
							<form>
								<button
									className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
									formAction={async () => {
										"use server";
										await auth.api.signOut({
											headers: await headers(),
										});
										redirect("/");
									}}
									type="submit"
								>
									Sign out
								</button>
							</form>
						)}
					</div>
				</div>
			</div>
		</HydrateClient>
	);
}
