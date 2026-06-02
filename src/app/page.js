import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import HistoryStory from "../components/HistoryStory";
import Menu from "../components/Menu";
import Gallery from "../components/Gallery";
import Reservation from "../components/Reservation";
import Reviews from "../components/Reviews";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

// Each section fetches its own dynamic data client-side from Firestore, so the
// homepage stays a lightweight static shell. (Previously this did a build-time
// getDoc whose result was never used — removed to drop the build-time network
// dependency for a fully static export.)
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
