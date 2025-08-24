import 'server-only';

export type Secrets = {
  adminEmail: string;
  adminUsername: string;
  adminPassword: string;
  secretToken: string;
  apiBaseUrl: string;
  analyticsId: string;
};

export const secrets: Secrets = {
  adminEmail: process.env.ADMIN_EMAIL ?? '',
  adminUsername: process.env.ADMIN_USERNAME ?? '',
  adminPassword: process.env.ADMIN_PASSWORD ?? '',
  secretToken: process.env.SECRET_TOKEN ?? '',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? '',
  analyticsId: process.env.NEXT_PUBLIC_ANALYTICS_ID ?? '',
};
