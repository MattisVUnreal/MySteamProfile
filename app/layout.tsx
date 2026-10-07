import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Play Together",
  description: "Find the Steam games you and your friends can play together tonight.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
