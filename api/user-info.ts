import { BaseApi } from "./base-api";
import { endpoints } from "../constants/endpoints";

export type UserInfoResponse = {
  organizationUserId: string;
  organizationUserCreateDate: string;
  organizationUserNameZh: string;
  organizationUserEmail: string;
  organizationUserAccount: string;
};

export class UserInfoApi extends BaseApi {
  async getInfo(): Promise<UserInfoResponse> {
    return this.get(
      `${endpoints.apiBaseUrl}/users/info`,
    ) as Promise<UserInfoResponse>;
  }
}
