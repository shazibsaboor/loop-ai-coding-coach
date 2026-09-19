import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Loop — Learn by building",
  description: "Your coding journey, one small breakthrough at a time. Practice JavaScript with real challenges and a thoughtful AI tutor.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
