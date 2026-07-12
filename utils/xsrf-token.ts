type CookieLike = {
  name: string;
  value: string;
};

export const getXsrfTokenFromCookies = (
  cookies: readonly CookieLike[],
): string | undefined =>
  cookies.find((cookie) => cookie.name === "XSRF-TOKEN")?.value;
