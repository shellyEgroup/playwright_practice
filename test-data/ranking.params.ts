import { modules, serviceModules } from "../constants/app-config";
import { routes } from "../constants/routes";

export const rankingTestParams = [
  {
    name: modules.knowledgeBase,
    serviceModuleValue: serviceModules.article,
    targetUrl: routes.knowledgeBase.root,
  },
  {
    name: modules.popular,
    serviceModuleValue: serviceModules.article,
    targetUrl: routes.popular.root,
  },
] as const;

export type RankingTestParam = (typeof rankingTestParams)[number];
