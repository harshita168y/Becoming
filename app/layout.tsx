import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Becoming — Your 60-day reset",
  description: "A gentle but intentional daily consistency tracker for your mind, body, and future.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
