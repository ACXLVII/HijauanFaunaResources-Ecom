import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from '@/app/hooks/useCart';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Hijauan Fauna",
  description: "For your landscaping needs.",
  icons: {
    icon: '/images/HFRlogo.png',
    shortcut: '/images/HFRlogo.png',
    apple: '/images/HFRlogo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <CartProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </CartProvider>
  );
}
