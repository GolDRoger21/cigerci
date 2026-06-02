"use client";
import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import "./Navbar.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    
    // Fetch site config settings
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "site_config");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data());
        }
      } catch (err) {
        console.error("Ayarlar yüklenirken hata oluştu:", err);
      }
    };
    
    fetchSettings();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLinkClick = (e, id) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    
    // Tarayıcı ortamında olup olmadığımızı ve anasayfada olup olmadığımızı doğrula
    const isHomePage = typeof window !== "undefined" && (window.location.pathname === "/" || window.location.pathname === "");
    
    if (!isHomePage) {
      // Eğer yasal bir alt sayfadaysak, doğrudan anasayfa hash'ine yönlendir
      if (typeof window !== "undefined") {
        window.location.href = `/#${id}`;
      }
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      const offset = settings?.announcementActive ? 116 : 80; // Navbar height + announcement offset
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


  const renderLogoText = () => {
    if (settings?.restaurantName) {
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
      {settings?.announcementActive && settings?.announcementText && (
        <div className="announcement-bar animate-zoom">
          <span className="announcement-text">{settings.announcementText}</span>
        </div>
      )}
      
      <nav className={`navbar ${scrolled ? "scrolled" : ""} ${settings?.announcementActive ? "has-announcement" : ""}`}>
        <div className="navbar-container">
          <a href="#" className="navbar-logo" onClick={(e) => handleLinkClick(e, "hero")}>
            <img src="/resimler/neset_logo.png" alt={`${settings?.restaurantName || "Ciğerci Neşet"} logo`} className="navbar-logo-img" />
            {renderLogoText()}
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
    </>
  );
}

