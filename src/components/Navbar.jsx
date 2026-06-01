"use client";
import React, { useState, useEffect } from "react";
import "./Navbar.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLinkClick = (e, id) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Navbar height offset
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
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <a href="#" className="navbar-logo" onClick={(e) => handleLinkClick(e, "hero")}>
          <span className="logo-icon">❖</span> CİĞERCİ <span className="gold-text">NEŞET</span>
        </a>

        {/* Desktop Menu */}
        <ul className="navbar-links">
          <li><a href="#hero" onClick={(e) => handleLinkClick(e, "hero")}>Anasayfa</a></li>
          <li><a href="#history" onClick={(e) => handleLinkClick(e, "history")}>Tarihimiz</a></li>
          <li><a href="#menu" onClick={(e) => handleLinkClick(e, "menu")}>Menü</a></li>
          <li><a href="#gallery" onClick={(e) => handleLinkClick(e, "gallery")}>Galeri</a></li>
          <li><a href="#reviews" onClick={(e) => handleLinkClick(e, "reviews")}>Yorumlar</a></li>
          <li><a href="#contact" onClick={(e) => handleLinkClick(e, "contact")}>İletişim</a></li>
        </ul>

        <div className="navbar-actions">
          <a href="#reservation" className="btn btn-primary btn-nav" onClick={(e) => handleLinkClick(e, "reservation")}>
            Rezervasyon Yap
          </a>
          <a href="/admin" className="admin-link-btn" title="Yönetici Paneli">🔑</a>
        </div>

        {/* Mobile Hamburger */}
        <button className={`hamburger ${mobileMenuOpen ? "active" : ""}`} onClick={toggleMobileMenu} aria-label="Menüyü Aç/Kapat">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
        <ul className="mobile-menu-links">
          <li><a href="#hero" onClick={(e) => handleLinkClick(e, "hero")}>Anasayfa</a></li>
          <li><a href="#history" onClick={(e) => handleLinkClick(e, "history")}>Tarihimiz</a></li>
          <li><a href="#menu" onClick={(e) => handleLinkClick(e, "menu")}>Menü</a></li>
          <li><a href="#gallery" onClick={(e) => handleLinkClick(e, "gallery")}>Galeri</a></li>
          <li><a href="#reviews" onClick={(e) => handleLinkClick(e, "reviews")}>Yorumlar</a></li>
          <li><a href="#contact" onClick={(e) => handleLinkClick(e, "contact")}>İletişim</a></li>
          <li className="mobile-action-li">
            <a href="#reservation" className="btn btn-primary btn-nav" onClick={(e) => handleLinkClick(e, "reservation")}>
              Rezervasyon Yap
            </a>
          </li>
          <li className="mobile-action-li">
            <a href="/admin" className="btn btn-secondary btn-nav" style={{ marginTop: "1rem" }}>
              Yönetici Girişi
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
