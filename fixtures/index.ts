import { mergeTests } from "@playwright/test";
import { apiFixtures } from "./api.fixtures";
import { knowledgeBaseVideoTagFixtures } from "./knowledge-base-video-tag.fixtures";

export const test = mergeTests(apiFixtures, knowledgeBaseVideoTagFixtures);
export { expect } from "@playwright/test";
