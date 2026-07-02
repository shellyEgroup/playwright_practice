import type { APIRequestContext, BrowserContext } from "@playwright/test";
import { config } from "../config";
import { endpoints } from "../constants/endpoints";

const LOGIN_URL = `${endpoints.apiBaseUrl}/users/login`;

export type LoginResponse = {
  loginId: string;
  loginTokenId: string;
  loginName: string;
  hasNext: boolean;
};

export class LoginApi {
  constructor(private readonly request: APIRequestContext) {}

  async login(account: string, password: string): Promise<LoginResponse> {
    const response = await this.request.post(LOGIN_URL, {
      data: {
        organizationUserAccount: account,
        organizationUserPassword: password,
      },
      timeout: config.timeout,
    });

    if (!response.ok()) {
      throw new Error(`POST ${LOGIN_URL} failed: ${response.status()}`);
    }

    return (await response.json()) as LoginResponse;
  }

  static buildAuthCookies(
    loginData: LoginResponse,
    loginAccount: string,
    cookieDomain: string,
  ): Parameters<BrowserContext["addCookies"]>[0] {
    const uInfo = LoginApi.buildUInfoCookie(
      loginData.loginName,
      loginAccount,
      loginData.hasNext,
    );

    return [
      {
        name: "u_lid",
        value: String(loginData.loginId),
        domain: cookieDomain,
        path: "/",
        secure: true,
        httpOnly: false,
        sameSite: "Lax",
      },
      {
        name: "u_tid",
        value: String(loginData.loginTokenId),
        domain: cookieDomain,
        path: "/",
        secure: true,
        httpOnly: false,
        sameSite: "Lax",
      },
      {
        name: "u_info",
        value: uInfo,
        domain: cookieDomain,
        path: "/",
        secure: true,
        httpOnly: false,
        sameSite: "Lax",
      },
    ];
  }

  private static buildUInfoCookie(
    loginName: string,
    loginAccount: string,
    hasNext: boolean,
  ) {
    return Buffer.from(
      JSON.stringify({
        loginName,
        loginAccount,
        hasNext,
      }),
      "utf-8",
    ).toString("base64");
  }
}
