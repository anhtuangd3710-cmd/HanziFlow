import type { Metadata } from "next";
import { AppProvider } from "@/context/AppContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "HanziFlow - Learn Chinese Characters & Vocabulary",
  description: "Master Chinese characters, build vocabulary, and track your progress with HanziFlow - your personal Chinese learning companion.",
  keywords: "chinese learning, hanzi, vocabulary, language learning, chinese characters",
  authors: [{ name: "HanziFlow Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hanziflow.com",
    title: "HanziFlow - Learn Chinese Characters & Vocabulary",
    description: "Master Chinese characters, build vocabulary, and track your progress with HanziFlow - your personal Chinese learning companion.",
    siteName: "HanziFlow",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "HanziFlow Logo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HanziFlow - Learn Chinese Characters & Vocabulary",
    description: "Master Chinese characters, build vocabulary, and track your progress with HanziFlow",
    images: ["/logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body suppressHydrationWarning>
        {googleClientId ? (
          <GoogleOAuthProvider clientId={googleClientId}>
            <AppProvider>{children}</AppProvider>
          </GoogleOAuthProvider>
        ) : (
          <AppProvider>{children}</AppProvider>
        )}
      </body>
    </html>
  );
}

