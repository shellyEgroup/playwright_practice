// config/routes.ts
export const routes = {
  home: "/",
  knowledgeBase: {
    root: "/knowledge-base",
    tabSub: (tagId: string) => `/knowledge-base?subTab=tag-${tagId}`,
  },
  popular: {
    root: "/popular",
  },
} as const;
