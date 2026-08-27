import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "Night English",
    template: "%s · Night English",
  },
  description:
    "Không gian học tiếng Anh ấm, tối và tập trung cho những buổi học ban đêm.",
  openGraph: {
    title: "Night English",
    description: "Read gently. Grow daily.",
    images: [{ url: "/og.png", width: 1792, height: 900, alt: "Night English" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Night English",
    description: "Read gently. Grow daily.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
