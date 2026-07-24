import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "../components/ThemeProvider";
import { Toaster } from "sonner";
import { AuthProvider } from "@/src/context/AuthContext";

const jetbrainsMonoHeading = JetBrains_Mono({ subsets: ['latin'], variable: '--font-heading' });
const nunitoSans = Nunito_Sans({ subsets: ['latin'], variable: '--font-sans' });
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Realtime Chat App",
  description: "Next.js realtime chat application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased",
        geistSans.variable,
        geistMono.variable,
        nunitoSans.variable,
        jetbrainsMonoHeading.variable
      )}
      suppressHydrationWarning
    >
      <head />
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
            <AuthProvider>
              {children}
              <Toaster richColors position="top-right" />
            </AuthProvider>
          </GoogleOAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}