"use client";
import React from "react";
import "./HistoryStory.css";

export default function HistoryStory() {
  return (
    <section id="history" className="history-section">
      <div className="section-container">
        
        {/* Title */}
        <div className="section-title-wrapper">
          <span className="section-subtitle">DİYARBAKIR KÜLTÜRÜ & TARİHİMİZ</span>
          <h2 className="section-title">Medeniyetler Beşiğinde Bir Lezzet Serüveni</h2>
        </div>

        {/* Content Grid */}
        <div className="history-grid">
          
          {/* Text Content */}
          <div className="history-text-column">
            <h3 className="history-subtitle-light">
              Diyarbakır'ın <span className="gold-text">Sur Surlarından</span> Ocakbaşı Ateşine...
            </h3>
            <p className="history-paragraph">
              Diyarbakır, insanlık tarihinin başladığı, 33 medeniyetin izlerini taşıyan kadim bir şehirdir. 
              Siyah bazalt taşlarından örülmüş tarihi Sur surları, asırlardır Hasan Paşa Hanı'nda demlenen 
              kervan sohbetleri ve Dicle'nin suyunu selamlayan Ongözlü Köprü... Bu köklü tarihin, Diyarbakır 
              halkının ruhuna işleyen en özel parçalarından biri de hiç şüphesiz <strong>Ciğer Kültürüdür</strong>.
            </p>
            <p className="history-paragraph">
              Ciğerci Neşet olarak bizler, bu asırlık mirası devralıp geleceğe taşıyoruz. Diyarbakır ciğeri, 
              sadece bir yemek değil; sabahın seher vaktinde ocakbaşında başlayan, dostluğu ve paylaşmayı 
              simgeleyen kutsal bir ritüeldir.
            </p>
            <p className="history-paragraph">
              Neşet Usta'nın özel terbiyesiyle dinlendirilen süt kuzusu ciğerleri, köz ateşiyle buluştuğu an, 
              hem Diyarbakır'ın tarihi dokusunu hem de ocakbaşı sıcaklığını tabaklarınıza taşır. Her lokmada 
              tarihin ve eşsiz lezzetin uyumunu hissedeceksiniz.
            </p>

            {/* Cultural stats */}
            <div className="history-stats">
              <div className="stat-card glass-card">
                <span className="stat-number gold-text">100%</span>
                <span className="stat-label">Süt Kuzu Ciğeri</span>
              </div>
              <div className="stat-card glass-card">
                <span className="stat-number gold-text">33</span>
                <span className="stat-label">Medeniyet Kültürü</span>
              </div>
              <div className="stat-card glass-card">
                <span className="stat-number gold-text">12+</span>
                <span className="stat-label">Doğal Çeşit Ezme</span>
              </div>
            </div>
          </div>

          {/* Graphic/Image Column */}
          <div className="history-image-column">
            <div className="image-frame-wrapper">
              <div className="image-frame-border-gold"></div>
              <img 
                src="/resimler/ciger_plating.png" 
                alt="Diyarbakır Tarihi Ocakbaşı Hazırlığı" 
                className="history-image" 
              />
              <div className="image-caption glass-card">
                <span>❖ Neşet Usta'nın Tarihi Ocakbaşı</span>
              </div>
            </div>
            
            {/* Embedded small secondary image */}
            <div className="secondary-image-wrapper">
              <img 
                src="/resimler/hero_ocakbasi.png" 
                alt="Ciğerin Közle Buluşma Anı" 
                className="secondary-history-image" 
              />
            </div>
          </div>

        </div>

      </div>

      {/* Decorative Parallax Striplet */}
      <div className="history-parallax-divider">
        <div className="parallax-bg-wrapper">
          <img src="/resimler/charcoal_ember.png" alt="Otantik Baharatlar" className="parallax-bg-img" />
          <div className="parallax-overlay"></div>
        </div>
        <div className="parallax-content text-center">
          <span className="motto glow-text">"Diyarbakır'da ciğer ocak başında, Neşet Usta'nın elinden yenir."</span>
        </div>
      </div>
    </section>
  );
}
