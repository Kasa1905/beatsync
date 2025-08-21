import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PostHogProvider } from "@/components/PostHogProvider";
import TQProvider from "@/components/TQProvider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Beatsync",
  description:
    "Beatsync is an open-source, web audio player built for multi-device playback.",
  keywords: ["music", "sync", "audio", "collaboration", "real-time"],
  authors: [{ name: "Freeman Jiang" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          inter.variable,
          "antialiased font-sans dark selection:bg-primary-800 selection:text-white"
        )}
      >
        <PostHogProvider>
          <ErrorBoundary>
            <TQProvider>
              {children}
              <Toaster 
                theme="dark" 
                position="top-center" 
                closeButton
                richColors
              />
              <Analytics />
            </TQProvider>
          </ErrorBoundary>
        </PostHogProvider>
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
        
        {/* Performance monitoring */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Monitor performance and adapt quality
              if ('performance' in window) {
                let frameCount = 0;
                let lastTime = performance.now();
                
                function measureFPS() {
                  frameCount++;
                  const now = performance.now();
                  if (now >= lastTime + 1000) {
                    const fps = frameCount * 1000 / (now - lastTime);
                    // Store FPS for audio quality adaptation
                    window.__beatsync_fps = fps;
                    frameCount = 0;
                    lastTime = now;
                  }
                  requestAnimationFrame(measureFPS);
                }
                requestAnimationFrame(measureFPS);
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
