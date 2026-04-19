import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  weight: ["300", "400", "500", "700"],
  subsets: ["arabic", "latin"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "ArabStream | اشتراك IPTV المميز",
  description: "أفضل خدمة بث تلفزيوني, 9000+ قناة, 21000+ فيلم, وأكثر من 8000 مسلسل بدون تقطيع.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} antialiased dark`}>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground selection:bg-brand-500/30 selection:text-brand-100">
        {children}
      </body>
    </html>
  );
}
