import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Providers } from './providers';
import AuthModal from './components/auth/auth-modal';
import ChatModal from './components/chat/chat-modal';
import AIChatButton from './components/ai/ai-chat-button';
import ThemeToggle from './components/ui/theme-toggle';

export const metadata: Metadata = {
  title: "Al-Quran - القرآن الكريم",
  description: "Read and explore the Holy Quran with translations and transliterations",
};

import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link 
          rel="preconnect" 
          href="https://fonts.googleapis.com" 
        />
        <link 
          rel="preconnect" 
          href="https://fonts.gstatic.com" 
          crossOrigin="anonymous" 
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Scheherazade+New:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800&family=Cairo:wght@300;400;500;600;700;800&display=swap" 
          rel="stylesheet" 
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <AuthModal />
          <ChatModal />
          <AIChatButton />
          <ThemeToggle />
          <Toaster position="top-center" richColors closeButton /> 
        </Providers>
      </body>
    </html>
  );
}
