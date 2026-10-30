import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export const metadata = {
  title: "Booklist",
  description: "La tua libreria personale di libri letti e da leggere",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body suppressHydrationWarning className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}