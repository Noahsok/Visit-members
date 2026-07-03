import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Visit — Membership",
  description: "Join Visit or sign in",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0E0D0B",
};

export default function JoinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
