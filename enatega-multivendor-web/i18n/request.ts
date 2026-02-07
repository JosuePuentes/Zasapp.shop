import { getUserLocale } from "@/lib/utils/methods/";
import { getRequestConfig } from "next-intl/server";

const SUPPORTED_LOCALES = [
  "ar", "az", "bn", "de", "en", "es", "fa", "fr", "gu", "he", "hi", "hr", "id",
  "it", "jp", "km", "ko", "ku", "mr", "nl", "pl", "ps", "pt", "ro", "ru", "te",
  "th", "tr", "ur", "uz", "vi", "zh",
] as const;

function getSafeLocale(locale: string): string {
  const base = locale.split("-")[0];
  return SUPPORTED_LOCALES.includes(base as any) ? base : "en";
}

export default getRequestConfig(async () => {
  let rawLocale: string | undefined;
  try {
    rawLocale = await getUserLocale();
  } catch {
    rawLocale = "en";
  }
  const locale = getSafeLocale(rawLocale || "en");

  let messages;
  try {
    messages = (await import(`../locales/${locale}.json`)).default;
  } catch {
    messages = (await import("../locales/en.json")).default;
  }

  return {
    locale,
    messages,
  };
});
