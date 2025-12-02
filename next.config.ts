/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env";

/** @type {import("next").NextConfig} */
const config = {
    images: {
        remotePatterns: [
            new URL("https://c-cdn.hel1.your-objectstorage.com/s/v3/**"),
            new URL("https://hc-cdn.hel1.your-objectstorage.com/s/v3/**"),
            new URL("https://icons.hackclub.com/api/icons/**"),
        ],
    },
};

export default config;
