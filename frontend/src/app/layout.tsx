import type { Metadata } from "next";
import { Bodoni_Moda, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { GridHeaderDecorator } from "@/components/layout/grid-header-decorator";
import { AuthProvider } from "@/components/auth/auth-provider";
import { QueryProvider } from "@/lib/api/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni-moda",
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: {
    default: "OuOglimmer's Blog",
    template: "%s | OuOglimmer's Blog",
  },
  description: "个人博客，记录技术、思考与生活。",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
  },
};

// 防止首屏主题闪烁：保留用户选择，没有记录时默认使用暗色主题。
const themeInitScript = `(function(){try{var t=localStorage.getItem("theme");document.documentElement.classList.toggle("dark",t!=="light")}catch(e){document.documentElement.classList.add("dark")}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} ${bodoniModa.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="flex min-h-[100dvh] flex-col bg-background text-foreground">
        <QueryProvider>
          <AuthProvider>
            <GridHeaderDecorator />
            <SiteHeader />
            <main className="relative flex-1">{children}</main>
            <SiteFooter />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
