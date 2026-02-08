import { DirectionProvider } from "@/lib/context/direction/DirectionContext";
import { ThemeProvider } from "@/lib/providers/ThemeProvider";
import { DirectionHandler } from "@/lib/ui/layouts/global/rtl/DirectionHandler";
// import InstallPWA from "@/lib/ui/pwa/InstallPWA";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import Script from "next/script";

export const metadata = {
  title: "Zas! — Mercado general",
  manifest: "/manifest.json",
};

// Evita pre-render estático: muchas rutas usan document/localStorage y fallan en el servidor
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let locale = "en";
  let messages: AbstractIntlMessages = {};
  try {
    locale = await getLocale();
    const m = await getMessages({ locale });
    messages = (m ?? {}) as AbstractIntlMessages;
  } catch {
    try {
      messages = (await import("@/locales/en.json")).default as AbstractIntlMessages;
    } catch {
      // fallback vacío para no romper la página
    }
  }
  const rtlLocales = ["ar", "hr", "fa", "ur"];
  const baseLocale = locale.split("-")[0];
  const dir =
    rtlLocales.includes(locale) || rtlLocales.includes(baseLocale)
      ? "rtl"
      : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        {/* 🔥 Inline theme script to prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem("theme");
                if (theme === "dark") {
                  document.documentElement.classList.add("dark");
                } else {
                  document.documentElement.classList.remove("dark");
                }
              })();
            `,
          }}
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"
          strategy="lazyOnload"
        />

        {/* Microsoft Clarity */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "tjqw9wn955");
          `}
        </Script>

        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#94e469" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        {/* Apple splash screen for specific device */}
        <link
          rel="apple-touch-startup-image"
          href="/splash-screen.png"
          media="(device-width: 390px) and (device-height: 844px)
          and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        {/* Add more media queries for other device sizes if needed */}
      </head>
      <body className={`flex flex-col flex-wrap ${dir === "rtl" ? "rtl" : ""}`}>
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <DirectionProvider dir={dir}>
              <DirectionHandler />
              {children}
              {/* <InstallPWA/> */}
            </DirectionProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
