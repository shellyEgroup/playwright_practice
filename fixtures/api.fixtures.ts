// fixtures/api.fixtures.ts
import { test as base } from "@playwright/test";
import { TagGroupApi } from "../api/tag-group-api";
import { RankingsApi } from "../api/rankings-api";

type ApiFixtures = {
  xsrfToken?: string;
  listTagGroupApi: TagGroupApi;
  rankingsApi: RankingsApi;
};

export const apiFixtures = base.extend<ApiFixtures>({
  xsrfToken: async ({ context }, use) => {
    const cookies = await context.cookies();
    const token = cookies.find((c) => c.name === "XSRF-TOKEN")?.value;
    await use(token);
  },

  listTagGroupApi: async ({ context, xsrfToken }, use) => {
    await use(new TagGroupApi(context.request, xsrfToken));
  },

  rankingsApi: async ({ context, xsrfToken }, use) => {
    await use(new RankingsApi(context.request, xsrfToken));
  },
});
