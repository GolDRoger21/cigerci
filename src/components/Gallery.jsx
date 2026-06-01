"use client";
import React, { useState } from "react";
import "./Gallery.css";

export default function Gallery() {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const images = [
    {
      src: "/resimler/Gemini_Generated_Image_4bnjhd4bnjhd4bnj.png",
      title: "Tescilli Diyarbakır Ciğeri",
      desc: "Zırh kıyması, sumaklı soğan ve sıcacık lavaş eşliğinde bakır tepside."
    },
    {
      src: "/resimler/Gemini_Generated_Image_6715f16715f16715.png",
      title: "Otantik Baharat Köşesi",
      desc: "Hakiki sumak, pul biber ve közün harı ile lezzetlenen sırlar."
    },
    {
      src: "/resimler/Gemini_Generated_Image_9s8ok99s8ok99s8o.png",
      title: "Neşet Usta'nın Tarihi Ocağı",
      desc: "Meşe kömürü közünde, asırlık usullerle pişen kuzu ciğer şişleri."
    },
    {
      src: "/resimler/Gemini_Generated_Image_pmvftppmvftppmvf.png",
      title: "Mistik Ocakbaşı Ambiansı",
      desc: "Bakır davlumbazlar ve eskitilmiş taş duvarlar arasında otantik bir gece."
    },
    {
      src: "/resimler/Gemini_Generated_Image_zdwcezdwcezdwcez.png",
      title: "Dumanı Üstünde Köz Keyfi",
      desc: "Ateşin kızıllığında kıvılcımlanan, lokum kıvamında pişen lezzet."
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
                <img src={img.src} alt={img.title} className="gallery-img" />
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
