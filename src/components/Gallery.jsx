"use client";
import React, { useState } from "react";
import "./Gallery.css";

export default function Gallery() {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const images = [
    {
      src: "/resimler/ciger_plating.png",
      title: "Tescilli Diyarbakır Ciğeri",
      desc: "Zırh kıyması, sumaklı soğan ve sıcacık lavaş eşliğinde bakır tepside."
    },
    {
      src: "/resimler/charcoal_ember.png",
      title: "Otantik Baharat Köşesi",
      desc: "Hakiki sumak, pul biber ve közün harı ile lezzetlenen sırlar."
    },
    {
      src: "/resimler/hero_ocakbasi.png",
      title: "Neşet Usta'nın Tarihi Ocağı",
      desc: "Meşe kömürü közünde, asırlık usullerle pişen kuzu ciğer şişleri."
    },
    {
      src: "/resimler/sur_historic.png",
      title: "Mistik Ocakbaşı Ambiansı",
      desc: "Bakır davlumbazlar ve eskitilmiş taş duvarlar arasında otantik bir gece."
    },
    {
      src: "/resimler/neset_logo.png",
      title: "Ciğerci Neşet Logosu",
      desc: "Tarihi lezzetin ve otantik Sur ocakbaşının simgesi tescilli logo."
    }
  ];

  const openLightbox = (index) => {
    setLightboxIndex(index);
    document.body.style.overflow = "hidden"; // Disable scroll when lightbox is open
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    document.body.style.overflow = "auto"; // Re-enable scroll
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setLightboxIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setLightboxIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <section id="gallery" className="gallery-section">
      <div className="section-container">
        
        {/* Title */}
        <div className="section-title-wrapper">
          <span className="section-subtitle">MEKAN GALERİSİ</span>
          <h2 className="section-title">Lezzetin ve Tarihin Görsel Yolculuğu</h2>
        </div>

        {/* Gallery Grid */}
        <div className="gallery-masonry-grid">
          {images.map((img, index) => (
            <div 
              key={index} 
              className={`gallery-item item-${index}`}
              onClick={() => openLightbox(index)}
            >
              <div className="gallery-img-wrapper">
                <img src={img.src} alt={img.title} className="gallery-img" loading="lazy" />
                <div className="gallery-item-overlay">
                  <div className="overlay-content">
                    <span className="gallery-item-decor">❖</span>
                    <h3 className="overlay-title">{img.title}</h3>
                    <p className="overlay-desc">{img.desc}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div className="lightbox-modal" onClick={closeLightbox}>
          <button className="lightbox-close-btn" onClick={closeLightbox}>✕</button>
          
          <button className="lightbox-nav-btn prev-btn" onClick={handlePrev}>‹</button>
          
          <div className="lightbox-content-box" onClick={(e) => e.stopPropagation()}>
            <img 
              src={images[lightboxIndex].src} 
              alt={images[lightboxIndex].title} 
              className="lightbox-main-img animate-zoom" 
            />
            <div className="lightbox-text-pane glass-card">
              <h3 className="lightbox-title gold-text">{images[lightboxIndex].title}</h3>
              <p className="lightbox-desc">{images[lightboxIndex].desc}</p>
              <span className="lightbox-counter">
                {lightboxIndex + 1} / {images.length}
              </span>
            </div>
          </div>
          
          <button className="lightbox-nav-btn next-btn" onClick={handleNext}>›</button>
        </div>
      )}
    </section>
  );
}
