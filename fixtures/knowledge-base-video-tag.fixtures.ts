// fixtures/knowledge-base-tag.fixtures.ts

import { apiFixtures } from "./api.fixtures";
import { serviceModules } from "../constants/app-config";

type OrganizationTag = {
  tagId: string;
  tagName: string;
};

type TagGroup = {
  tagGroupId: string;
  tagGroupName: string;
  organizationTagList: OrganizationTag[];
};

type ListTagGroupResponse = {
  total: number;
  source: TagGroup[];
};

type KnowledgeBaseTagFixtures = {
  videoTagId: string;
};

const VIDEO_TAG_NAME = "影音專區";

function findTagIdByTagName(params: {
  response: ListTagGroupResponse;
  tagName: string;
}) {
  const { response, tagName } = params;

  const tags = response.source.flatMap(
    (tagGroup) => tagGroup.organizationTagList,
  );

  const targetTag = tags.find((tag) => tag.tagName.includes(tagName));

  if (!targetTag) {
    throw new Error(`找不到包含「${tagName}」的 tag`);
  }

  return targetTag.tagId;
}

export const knowledgeBaseVideoTagFixtures =
  apiFixtures.extend<KnowledgeBaseTagFixtures>({
    videoTagId: async ({ listTagGroupApi }, use) => {
      const response = await listTagGroupApi.list({
        serviceModuleValue: serviceModules.article,
      });

      const videoTagId = findTagIdByTagName({
        response,
        tagName: VIDEO_TAG_NAME,
      });

      await use(videoTagId);
    },
  });
