import { type Metadata } from "next";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
// @ts-ignore: CSS import without type declarations
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Task Management App",
  description:
    "Manage your workflow efficiently. Track, edit, and complete tasks with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <header className="flex justify-end items-center p-4 gap-4 h-16 border-b">
            <SignedOut>
              <SignInButton>
                <button className="bg-indigo-600 text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-indigo-700 transition">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="bg-green-600 text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-green-700 transition">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </header>

          <main className="p-4">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
