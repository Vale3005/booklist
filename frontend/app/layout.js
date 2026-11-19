import "./globals.css";
import { Lora, Nunito } from "next/font/google";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const fontTesto = Nunito({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontTitoli = Lora({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata = {
  title: "Booklist",
  description: "La tua libreria personale di libri letti e da leggere",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" className={`${fontTesto.variable} ${fontTitoli.variable}`}>
      <body suppressHydrationWarning className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}