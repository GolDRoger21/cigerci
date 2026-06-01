import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import HistoryStory from "../components/HistoryStory";
import Menu from "../components/Menu";
import Gallery from "../components/Gallery";
import Reviews from "../components/Reviews";
import Contact from "../components/Contact";

export default function Home() {
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
            <h3>CİĞERCİ <span className="gold-text">NEŞET</span></h3>
            <p>Diyarbakır'ın Kadim Tarihinden, Ocakbaşı Sıcaklığıyla Sofranıza...</p>
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
            <p>Haftanın Her Günü: 08:00 - 02:00</p>
            <p className="footer-motto-highlight gold-text">Gece Ciğeri Servisimiz Mevcuttur.</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Ciğerci Neşet. Tüm Hakları Saklıdır.</p>
          <span className="footer-designer-sign">Tasarım & Altyapı: Next.js + Google Firebase</span>
        </div>
      </footer>
    </>
  );
}
