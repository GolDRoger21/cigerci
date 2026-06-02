import "./globals.css";

export const metadata = {
  title: "Tarihi Sur Ocakbaşı Ciğerci Neşet | Diyarbakır'ın Tescilli Ciğer Lezzeti",
  description: "Tarihi Sur surlarının gölgesinde, Neşet Usta'nın meşe kömürü közünde ağır ağır pişen tescilli Diyarbakır kuzu ciğerinin enfes lezzeti. Canlı ocakbaşı rezervasyonu yapın.",
  keywords: "diyarbakır ciğeri, ciğerci neşet, suriçi ciğerci, diyarbakır ocakbaşı, meşhur kuzu ciğer, sur kebap salonu, tescilli ciğer",
  authors: [{ name: "Ciğerci Neşet" }],
  icons: {
    icon: "/resimler/neset_logo.png",
    shortcut: "/resimler/neset_logo.png",
    apple: "/resimler/neset_logo.png"
  }
};


export const viewport = {
  width: "device-width",
  initialScale: 1.0
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        {/* Preconnect for faster resource loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://identitytoolkit.googleapis.com" />
        <link rel="preconnect" href="https://securetoken.googleapis.com" />
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://s.ytimg.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
