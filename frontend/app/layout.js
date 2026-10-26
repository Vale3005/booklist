import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "Booklist",
  description: "La tua libreria personale di libri letti e da leggere",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}