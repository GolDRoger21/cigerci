import "./globals.css";

export const metadata = {
  title: "Tarihi Sur Ocakbaşı Ciğerci Neşet | Diyarbakır'ın Tescilli Ciğer Lezzeti",
  description: "Tarihi Sur surlarının gölgesinde, Neşet Usta'nın meşe kömürü közünde ağır ağır pişen tescilli Diyarbakır kuzu ciğerinin enfes lezzeti. Canlı ocakbaşı rezervasyonu yapın.",
  keywords: "diyarbakır ciğeri, ciğerci neşet, suriçi ciğerci, diyarbakır ocakbaşı, meşhur kuzu ciğer, sur kebap salonu, tescilli ciğer",
  authors: [{ name: "Ciğerci Neşet" }]
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
