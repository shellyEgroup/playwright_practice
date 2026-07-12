import path from "path";

export const config = {
  baseUrl: "https://www.familyfinhealth.com",

  organizationId: "yMJHyi6R1CB9whpdNvtA",
  organizationOldId: "0A4f9LDYSg2A7OzOih8A3g",

  storageStates: {
    authenticated: path.resolve(
      process.cwd(),
      "playwright/.auth/authenticated.json",
    ),
    guest: path.resolve(process.cwd(), "playwright/.auth/guest.json"),
  },

  timeout: 30000,
  longTimeout: 600000,

  locale: "zh_TW",

  testMember: {
    account: "universal.possum.csoc@hidingmail.net",
    password: "Aa12345.",
  },
};
