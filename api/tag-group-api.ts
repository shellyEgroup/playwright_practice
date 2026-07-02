import { config } from "../config";
import { endpoints } from "../constants/endpoints";
import { filterKeys, tagGroupId } from "../constants/app-config";
import { BaseApi } from "./base-api";

interface TagGroupListParams {
  serviceModuleValue: string;
}

interface TagGroupListPayload {
  filterKey?: string;
  value?: string[];
  locale?: string;
}

export class TagGroupApi extends BaseApi {
  async list(params: TagGroupListParams, payload: TagGroupListPayload = {}) {
    const { serviceModuleValue } = params;
    const {
      filterKey = filterKeys.knowledgeBase,
      value = [tagGroupId],
      locale = config.locale,
    } = payload;

    const url = `${endpoints.apiOldBaseUrl}/search/public/tag-groups?serviceModuleValue=${serviceModuleValue}`;

    return this.post(url, {
      equal: [{ filterKey, value }],
      locale,
    });
  }
}
