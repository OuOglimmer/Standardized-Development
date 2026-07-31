import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: {
    default: "OuOglimmer's Blog",
    template: "%s | OuOglimmer's Blog",
  },
  description: "个人博客 —— 记录技术、思考与生活。",
};

// 防止首屏主题闪烁：在浏览器绘制前同步读取用户偏好并设置 .dark 类。
// 优先级：localStorage > 系统偏好。回退到亮色。
const themeInitScript = `(function(){try{var t=localStorage.getItem("theme");var m=window.matchMedia("(prefers-color-scheme: dark)").matches;if(t==="dark"||(!t&&m)){document.documentElement.classList.add("dark")}}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background">
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
