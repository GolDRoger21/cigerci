import React from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import HistoryStory from "../components/HistoryStory";
import Menu from "../components/Menu";
import Gallery from "../components/Gallery";
import Reservation from "../components/Reservation";
import Reviews from "../components/Reviews";
import Contact from "../components/Contact";

export default async function Home() {
  let settings = {
    restaurantName: "Ciğerci Neşet",
    slogan: "Diyarbakır'ın Kadim Tarihinden, Ocakbaşı Sıcaklığıyla Sofranıza...",
    workingHours: "Haftanın Her Günü: 08:00 - Gece 02:00",
    mottoHighlight: "Gece Ciğeri Servisimiz Mevcuttur."
  };

  try {
    const docRef = doc(db, "settings", "site_config");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      settings = docSnap.data();
    }
  } catch (err) {
    console.error("Sunucu tarafında ayarlar yüklenemedi:", err);
  }

  const renderFooterLogoText = () => {
    if (settings.restaurantName) {
      const parts = settings.restaurantName.split(" ");
      if (parts.length > 1) {
        const lastWord = parts.pop();
        const mainParts = parts.join(" ");
        return (
          <>
            {mainParts.toUpperCase()} <span className="gold-text">{lastWord.toUpperCase()}</span>
          </>
        );
      }
      return <span className="gold-text">{settings.restaurantName.toUpperCase()}</span>;
    }
    return (
      <>
        CİĞERCİ <span className="gold-text">NEŞET</span>
      </>
    );
  };

  return (
    <>
      {/* Sticky Header Nav */}
      <Navbar />

      {/* Main Sections flow */}
      <main>
        {/* Fullscreen Video Hero */}
        <Hero />

        {/* Diyarbakır & Culture Section */}
        <HistoryStory />

        {/* Interactive Menu from Firestore */}
        <Menu />

        {/* Mosaic Masonry Gallery with custom Lightbox */}
        <Gallery />

        {/* Table Booking System */}
        <Reservation />

        {/* Real-time Reviews and new review submissions */}
        <Reviews />

        {/* Contact and Maps */}
        <Contact />
      </main>

      {/* Visually Rich Footer */}
      <footer className="footer-pane">
        <div className="footer-container">
          <div className="footer-brand">
            <span className="footer-logo">❖</span>
            <h3>{renderFooterLogoText()}</h3>
            <p>{settings.slogan}</p>
          </div>
          
          <div className="footer-links-col">
            <h4>Hızlı Linkler</h4>
            <ul>
              <li><a href="#hero">Anasayfa</a></li>
              <li><a href="#history">Tarihimiz</a></li>
              <li><a href="#menu">Menü</a></li>
              <li><a href="#reservation">Rezervasyon</a></li>
              <li><a href="#reviews">Yorumlar</a></li>
            </ul>
          </div>

          <div className="footer-info-col">
            <h4>Çalışma Saatleri</h4>
            <p>{settings.workingHours}</p>
            {settings.mottoHighlight && (
              <p className="footer-motto-highlight gold-text">{settings.mottoHighlight}</p>
            )}
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} {settings.restaurantName}. Tüm Hakları Saklıdır.</p>
          <span className="footer-designer-sign">Tasarım & Altyapı: Next.js + Google Firebase</span>
        </div>
      </footer>
    </>
  );
}

