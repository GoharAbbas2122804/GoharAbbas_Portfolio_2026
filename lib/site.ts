const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined);

/** Production origin used for canonical metadata and crawler files. */
export const siteUrl = configuredSiteUrl
  ? new URL(configuredSiteUrl.endsWith("/") ? configuredSiteUrl : `${configuredSiteUrl}/`)
  : undefined;
