import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";

type AppRouterInputs = inferRouterInputs<AppRouter>;
type AppRouterOutputs = inferRouterOutputs<AppRouter>;

export type RouterInputs = AppRouterInputs;
export type RouterOutputs = AppRouterOutputs;

export type Stickers = RouterOutputs["stickers"]["getStickers"];
export type ImportNewStickersFromJsonInput =
    RouterInputs["stickers"]["importNewStickersFromJson"];
