import { config } from "../config";

const apiPrefix = `/api/v1/organizations`;
export const endpoints = {
  apiBaseUrl: `${apiPrefix}/${config.organizationId}`,
  apiOldBaseUrl: `${apiPrefix}/${config.organizationOldId}`,
} as const;
