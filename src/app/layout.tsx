import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "MoneyTrail — gestiune proiecte, cheltuieli și marjă",
  description:
    "Demo interactiv: aplicație de gestiune pentru firme mici de execuție — proiecte, cheltuieli, manoperă, încasări, marjă și rapoarte. Date fictive.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ro"
      className={`h-full antialiased ${openSans.variable} ${montserrat.variable}`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
