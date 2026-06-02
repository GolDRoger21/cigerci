"use client";
import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import "./Hero.css";

export default function Hero() {
  const [heroVideoId, setHeroVideoId] = useState("Hzq_6lFJZUI");
  const [videoActive, setVideoActive] = useState(false);

  // Fetch dynamic video setting from Firestore config
  useEffect(() => {
    const fetchVideoSetting = async () => {
      try {
        const docRef = doc(db, "settings", "site_config");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.heroVideoId) {
            setHeroVideoId(data.heroVideoId);
          }
        }
      } catch (err) {
        console.error("Video ayarı yüklenirken hata oluştu:", err);
      }
    };
    fetchVideoSetting();
  }, []);

  // Delay fading in the iframe to completely hide initial YouTube player buttons and loading states
  useEffect(() => {
    setVideoActive(false);
    const timer = setTimeout(() => {
      setVideoActive(true);
    }, 1800); // 1.8 seconds is the sweet spot for YouTube to autoplay muted in the background
    return () => clearTimeout(timer);
  }, [heroVideoId]);

  const handleScrollTo = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <section id="hero" className="hero-section">
      {/* Autoplay & Loop YouTube Background Video with Smooth Fade-in */}
      <div className="video-background-container">
        {/* Sharp Static Poster shown during load */}
        <div className={`hero-poster-image ${videoActive ? "fade-out" : ""}`}></div>
        
        <iframe
          className={`video-bg-iframe ${videoActive ? "fade-in" : ""}`}
          src={`https://www.youtube.com/embed/${heroVideoId}?autoplay=1&mute=1&loop=1&playlist=${heroVideoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1`}
          frameBorder="0"
          allow="autoplay; encrypted-media"
          title="Ciğerci Neşet Canlı Ocakbaşı Videosu"
        ></iframe>
        <div className="hero-overlay"></div>
      </div>

      {/* Hero Content */}
      <div className="hero-content">
        <span className="hero-subtitle glow-text">MİSTİK BİR OCAKBAŞI DENEYİMİ</span>
        <h1 className="hero-title">
          Tarihin Lezzetle <br />
          Buluştuğu Yer: <span className="gold-text">Ciğerci Neşet</span>
        </h1>
        <p className="hero-description">
          Diyarbakır'ın bin yıllık ocakbaşı kültürünü, en taze kuzu ciğeri ve asırlık köz ateşinin 
          benzersiz uyumuyla sofranıza taşıyoruz. Neşet Usta'nın tescilli el lezzetiyle harmanlanmış 
          gerçek ocakbaşı ziyafetini keşfedin.
        </p>

        <div className="hero-cta-group">
          <a 
            href="#reservation" 
            className="btn btn-primary btn-hero" 
            onClick={(e) => handleScrollTo(e, "reservation")}
          >
            Rezervasyon Yap 📅
          </a>
          <a 
            href="#menu" 
            className="btn btn-secondary btn-hero" 
            onClick={(e) => handleScrollTo(e, "menu")}
          >
            Menümüzü İncele 🍽️
          </a>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <a 
        href="#history" 
        className="scroll-down-indicator" 
        onClick={(e) => handleScrollTo(e, "history")}
        aria-label="Aşağı Kaydır"
      >
        <span className="scroll-arrow">↓</span>
      </a>
    </section>
  );
}
