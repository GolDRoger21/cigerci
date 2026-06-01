"use client";
import React from "react";
import "./Hero.css";

export default function Hero() {
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
      {/* Background Video */}
      <div className="video-background-container">
        <video 
          className="video-bg" 
          autoPlay 
          loop 
          muted 
          playsInline 
          poster="/resimler/hero_ocakbasi.png"
        >
          <source src="/Bu lezzeti herkesin tatmasını isteriz.mp4" type="video/mp4" />
          Tarayıcınız video etiketini desteklemiyor.
        </video>
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
