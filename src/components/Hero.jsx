"use client";
import React, { useState, useEffect } from "react";
import "./Hero.css";

export default function Hero() {
  const [videoOpen, setVideoOpen] = useState(false);

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setVideoOpen(false);
    };
    if (videoOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [videoOpen]);

  return (
    <section id="hero" className="hero-section">
      {/* Dynamic Ken Burns Background */}
      <div className="video-background-container">
        <div className="hero-bg-image"></div>
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
          <button 
            className="btn btn-video btn-hero animate-pulse-glow"
            onClick={() => setVideoOpen(true)}
          >
            Tanıtım Videosunu İzle 🎥
          </button>
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

      {/* 🎬 PREMIUM GLASSMORPHIC VIDEO MODAL OVERLAY */}
      {videoOpen && (
        <div className="video-modal-overlay" onClick={() => setVideoOpen(false)}>
          <div className="video-modal-container glass-card animate-zoom" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button className="video-modal-close-btn" onClick={() => setVideoOpen(false)} aria-label="Kapat">
              ✕
            </button>
            
            {/* Modal Video Body (Styled for 9:16 Portrait YouTube Short) */}
            <div className="video-modal-body">
              <iframe
                className="video-iframe"
                src="https://www.youtube.com/embed/Hzq_6lFJZUI?autoplay=1&mute=0&rel=0&modestbranding=1"
                title="Ciğerci Neşet Tanıtım Videosu"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
