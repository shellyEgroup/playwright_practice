// api/base_api.ts
import { APIRequestContext } from "@playwright/test";
import { config } from "../config";

export class BaseApi {
  protected request: APIRequestContext;
  protected xsrfToken?: string;

  constructor(request: APIRequestContext, xsrfToken?: string) {
    this.request = request;
    this.xsrfToken = xsrfToken;
  }

  private get headers(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.xsrfToken) {
      headers["X-XSRF-TOKEN"] = this.xsrfToken;
    }

    return headers;
  }

  protected async get(url: string) {
    const res = await this.request.get(url, {
      headers: this.headers,
      timeout: config.timeout,
    });
    if (!res.ok()) throw new Error(`GET ${url} failed: ${res.status()}`);
    return res.json();
  }

  protected async post(url: string, payload: object) {
    const res = await this.request.post(url, {
      headers: this.headers,
      data: payload,
      timeout: config.timeout,
    });
    if (!res.ok()) throw new Error(`POST ${url} failed: ${res.status()}`);
    return res.json();
  }

  protected async patch(url: string, payload: object) {
    const res = await this.request.patch(url, {
      headers: this.headers,
      data: payload,
      timeout: config.timeout,
    });
    if (!res.ok()) throw new Error(`PATCH ${url} failed: ${res.status()}`);
    return res.json();
  }

  protected async delete(url: string) {
    const res = await this.request.delete(url, {
      headers: this.headers,
      data: {},
      timeout: config.timeout,
    });
    if (!res.ok()) throw new Error(`DELETE ${url} failed: ${res.status()}`);
    return res.json();
  }
}
