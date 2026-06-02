"use client";
import React, { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import "./Menu.css";

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState("hepsi");
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const q = query(collection(db, "menu"), orderBy("order", "asc"));
        const querySnapshot = await getDocs(q);
        const items = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setMenuItems(items);
        setLoading(false);
      } catch (err) {
        console.error("Menü yükleme hatası:", err);
        setError("Menü yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const categories = [
    { id: "hepsi", name: "TÜMÜ" },
    { id: "cigerler", name: "CİĞERLER" },
    { id: "kebaplar", name: "KEBAPLAR" },
    { id: "mezeler", name: "MEZELER & İKRAMLAR" },
    { id: "tatlilar", name: "TATLILAR" },
    { id: "icecekler", name: "İÇECEKLER" }
  ];

  const filteredItems = activeCategory === "hepsi"
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <section id="menu" className="menu-section">
      <div className="section-container">
        
        {/* Title */}
        <div className="section-title-wrapper">
          <span className="section-subtitle">DİYARBAKIR LEZZET ŞÖLENİ</span>
          <h2 className="section-title">Eşsiz Ocakbaşı Menümüz</h2>
        </div>

        {/* Categories Tab bar */}
        <div className="categories-tab-bar">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-tab-btn ${activeCategory === category.id ? "active" : ""}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        {loading ? (
          <div className="menu-loading-spinner-wrapper">
            <div className="menu-spinner"></div>
            <p>Lezzetler hazırlanıyor, köz harlandırılıyor...</p>
          </div>
        ) : error ? (
          <div className="menu-error-message glass-card">
            <span className="error-icon">⚠</span>
            <p>{error}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="menu-empty glass-card text-center">
            <p>Seçilen kategoride henüz lezzet bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="menu-grid">
            {filteredItems.map((item) => (
              <div key={item.id} className="menu-card glass-card">
                {/* Ribbon Tag if exists */}
                {item.tag && (
                  <span className={`menu-card-tag ${item.tag.includes("İkram") || item.tag.includes("Ücretsiz") ? "tag-free" : "tag-special"}`}>
                    {item.tag}
                  </span>
                )}
                
                {/* Yemek Görseli */}
                {item.imageUrl && (
                  <div className="menu-card-image-wrapper">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="menu-card-image"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = "/resimler/sur_basalt_texture.png";
                      }}
                    />
                  </div>
                )}
                
                <div className="menu-card-header">
                  <h3 className="menu-item-name">{item.name}</h3>
                  <span className="menu-item-price gold-text">
                    {item.price > 0 ? `${item.price} ₺` : "İkram"}
                  </span>
                </div>


                <div className="menu-item-divider"></div>

                <p className="menu-item-description">
                  {item.description}
                </p>

                <div className="menu-card-footer">
                  <span className="menu-leaf-icon">❖</span>
                  <span className="menu-availability">
                    {item.isAvailable ? "✔ Taze Hazırlanır" : "❌ Tükendi"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
