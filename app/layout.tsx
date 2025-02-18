 import { Metadata } from "next"; 
import { Toaster } from "sonner";

import { Navbar } from "@/components/custom/navbar";
import { ThemeProvider } from "@/components/custom/theme-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Tama - Your AI Assistant",
  description: "Tama is your witty, confident, and all-knowing AI assistant, ready to assist with anything you need.",
  openGraph: {
    images: [
      {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCc8Oka5KG7mzlkpeRZE8nVR_KjK4_mMg0NQ&s",
        width: 800,
        height: 600,
        alt: "Tama AI Assistant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [
      {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCc8Oka5KG7mzlkpeRZE8nVR_KjK4_mMg0NQ&s",
        width: 800,
        height: 600,
        alt: "Tama AI Assistant",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-center" />
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
