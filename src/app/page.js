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
import Footer from "../components/Footer";

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
            {mainParts.toLocaleUpperCase("tr-TR")} <span className="gold-text">{lastWord.toLocaleUpperCase("tr-TR")}</span>
          </>
        );
      }
      return <span className="gold-text">{settings.restaurantName.toLocaleUpperCase("tr-TR")}</span>;
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

      {/* Dynamic Footer with Premium Modals */}
      <Footer />
    </>
  );
}

