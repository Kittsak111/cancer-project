import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// เรียกใช้ ThemeProvider จากโฟลเดอร์ components
import { ThemeProvider } from "../components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cancer Cell Analyzer",
  description: "AI System for Cancer Cell Analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning ช่วยแก้ปัญหาธีมกระพริบตอนโหลด
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}