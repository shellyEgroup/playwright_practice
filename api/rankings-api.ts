import { endpoints } from "../constants/endpoints";
import {
  actionTypes,
  dateRangePresets,
  defaultLimit,
} from "../constants/app-config";
import { BaseApi } from "./base-api";

interface RankingsListPayload {
  limit?: number;
  actionType?: string;
  dateRangePreset?: string;
  serviceModule: string;
}

export class RankingsApi extends BaseApi {
  async list(payload: RankingsListPayload) {
    const {
      limit = defaultLimit,
      actionType = actionTypes.read,
      dateRangePreset = dateRangePresets.allTime,
      serviceModule,
    } = payload;
    const url = `${endpoints.apiBaseUrl}/rankings`;
    return this.post(url, {
      serviceModule,
      actionType,
      limit,
      dateRangePreset,
    });
  }
}
