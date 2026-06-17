import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DashboardProvider } from "@/store/dashboardStore";
import { ThemeProvider } from "next-themes";
import ThemeToggle from "@/components/ui/ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Panda Hub",
  description: "Booking frequency dashboard for Panda Hub",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-[#F2F2F7]">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="panda-hub-theme"
          disableTransitionOnChange={false}
        >
          <DashboardProvider>
            {children}
          </DashboardProvider>
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
