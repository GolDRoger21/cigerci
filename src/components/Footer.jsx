"use client";
import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import "./Footer.css";

export default function Footer() {
  const [settings, setSettings] = useState({
    restaurantName: "Ciğerci Neşet",
    slogan: "Diyarbakır'ın Kadim Tarihinden, Ocakbaşı Sıcaklığıyla Sofranıza...",
    workingHours: "Haftanın Her Günü: 08:00 - Gece 02:00",
    mottoHighlight: "Gece Ciğeri Servisimiz Mevcuttur."
  });

  // Legal Modal States
  const [activeDocId, setActiveDocId] = useState(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const fallbackLegalTexts = {
    privacy_policy: {
      title: "Gizlilik Politikası",
      content: `Ciğerci Neşet olarak, web sitemizi ziyaret eden misafirlerimizin kişisel verilerinin korunmasına ve gizliliğine son derece önem veriyoruz. Bu Gizlilik Politikası, sitemiz üzerinden toplanan bilgilerin nasıl kullanıldığını ve korunduğunu açıklamaktadır.

1. Toplanan Veriler:
Web sitemiz üzerinden masa rezervasyonu yaptığınızda veya iletişim formunu doldurduğunuzda; adınız soyadınız, telefon numaranız, e-posta adresiniz ve rezervasyon notlarınız gibi bilgiler toplanmaktadır.

2. Verilerin Kullanım Amacı:
Toplanan kişisel verileriniz, sadece masa rezervasyonunuzun doğrulanması, taleplerinizin yanıtlanması ve sizlere daha iyi bir ocakbaşı hizmeti sunulabilmesi amacıyla kullanılmaktadır. Bilgileriniz kesinlikle üçüncü şahıslarla paylaşılmaz veya ticari amaçla satılmaz.

3. Güvenlik:
Verileriniz güvenli Google Cloud ve Firebase sunucularında depolanmakta olup, yetkisiz erişimleri engellemek için gerekli tüm teknik ve idari güvenlik önlemleri alınmıştır.`
    },
    terms_of_use: {
      title: "Kullanım Koşulları",
      content: `Ciğerci Neşet web sitesine hoş geldiniz. Sitemizi kullanarak aşağıda belirtilen kullanım koşullarını kabul etmiş sayılmaktasınız.

1. Hizmet Kapsamı:
Bu web sitesi, Ciğerci Neşet restoranının menüsünü incelemek, online masa rezervasyon talebi oluşturmak ve restoranımızla iletişim kurmak amacıyla hazırlanmıştır.

2. Rezervasyon Kuralları:
Sitemiz üzerinden yapılan rezervasyonlar bir ön talep niteliğindedir. Rezervasyonunuz, ekibimiz tarafından telefonla aranarak onaylanmadığı sürece kesinleşmiş sayılmaz. Yoğun günlerde rezervasyon saatinden 15 dakika sonra gelmeyen misafirlerimizin masaları iptal edilebilir.

3. Fikri Mülkiyet:
Sitede yer alan tüm logolar, grafikler, iştah açıcı görseller ve metinler Ciğerci Neşet'in fikri mülkiyetindedir. İzinsiz kopyalanması veya ticari amaçla kullanılması yasaktır.`
    },
    kvkk: {
      title: "KVKK Aydınlatma Metni",
      content: `Kişisel Verilerin Korunması Kanunu (KVKK) Aydınlatma Metni

Ciğerci Neşet olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, veri sorumlusu sıfatıyla siz değerli misafirlerimizin kişisel verilerini yasal sınırlar dahilinde işlemekteyiz.

1. Kişisel Verilerin İşlenme Amacı:
Masa rezervasyonu taleplerinin alınması, müşteri memnuniyeti değerlendirmelerinin takibi, şikayet ve önerilerinizin yanıtlanması amacıyla kişisel verileriniz işlenmektedir.

2. İşlenen Verileriniz ve Aktarımı:
Ad, soyad, telefon ve e-posta verileriniz kanuni yükümlülükler haricinde üçüncü parti kurum veya şahıslara aktarılmamakta, sadece restoran bünyesindeki yönetim sisteminde saklanmaktadır.

3. Haklarınız:
Kanun kapsamında kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, eksik veya yanlış işlenmişse düzeltilmesini isteme haklarına sahipsiniz. Taleplerinizi info@cigercineset.com adresine iletebilirsiniz.`
    }
  };

  useEffect(() => {
    // Load site configurations
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "site_config");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (err) {
        console.error("Footer ayarları yüklenemedi:", err);
      }
    };
    fetchSettings();
  }, []);

  // Fetch and Open Legal Modal
  const openLegalModal = async (docId) => {
    setActiveDocId(docId);
    setModalTitle(fallbackLegalTexts[docId].title);
    setModalContent(fallbackLegalTexts[docId].content);
    setModalLoading(true);

    try {
      const docRef = doc(db, "legal", docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setModalTitle(data.title || fallbackLegalTexts[docId].title);
        setModalContent(data.content || fallbackLegalTexts[docId].content);
      }
    } catch (err) {
      console.error("Yasal döküman canlı veri çekilemedi, yedeğe bağlanıldı:", err);
    }
    setModalLoading(false);
  };

  const closeLegalModal = () => {
    setActiveDocId(null);
  };

  // Close modal on escape press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeLegalModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLinkClick = (e, id) => {
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

  const renderFooterLogoText = () => {
    if (settings.restaurantName) {
      const parts = settings.restaurantName.split(" ");
      if (parts.length > 1) {
        const lastWord = parts.pop();
        const mainParts = parts.join(" ");
        return (
          <>
            {mainParts.toUpperCase()} <span className="gold-text">{lastWord.toUpperCase()}</span>
          </>
        );
      }
      return <span className="gold-text">{settings.restaurantName.toUpperCase()}</span>;
    }
    return (
      <>
        CİĞERCİ <span className="gold-text">NEŞET</span>
      </>
    );
  };

  return (
    <>
      <footer className="footer-pane">
        <div className="footer-container">
          <div className="footer-brand animate-zoom">
            <span className="footer-logo">❖</span>
            <h3>{renderFooterLogoText()}</h3>
            <p>{settings.slogan}</p>
          </div>
          
          <div className="footer-links-col">
            <h4>Hızlı Linkler</h4>
            <ul>
              <li><a href="#hero" onClick={(e) => handleLinkClick(e, "hero")}>Anasayfa</a></li>
              <li><a href="#history" onClick={(e) => handleLinkClick(e, "history")}>Tarihimiz</a></li>
              <li><a href="#menu" onClick={(e) => handleLinkClick(e, "menu")}>Menü</a></li>
              <li><a href="#reservation" onClick={(e) => handleLinkClick(e, "reservation")}>Rezervasyon</a></li>
              <li><a href="#reviews" onClick={(e) => handleLinkClick(e, "reviews")}>Yorumlar</a></li>
            </ul>
          </div>

          <div className="footer-info-col">
            <h4>Çalışma Saatleri</h4>
            <p>{settings.workingHours}</p>
            {settings.mottoHighlight && (
              <p className="footer-motto-highlight gold-text">{settings.mottoHighlight}</p>
            )}
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-legal-links" style={{ marginBottom: "1rem", display: "flex", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            <button onClick={() => openLegalModal("privacy_policy")} className="footer-modal-trigger-btn">Gizlilik Politikası</button>
            <span style={{ color: "rgba(255,255,255,0.1)", fontSize: "0.8rem" }}>|</span>
            <button onClick={() => openLegalModal("terms_of_use")} className="footer-modal-trigger-btn">Kullanım Koşulları</button>
            <span style={{ color: "rgba(255,255,255,0.1)", fontSize: "0.8rem" }}>|</span>
            <button onClick={() => openLegalModal("kvkk")} className="footer-modal-trigger-btn">KVKK Aydınlatma Metni</button>
          </div>
          <p>© {new Date().getFullYear()} {settings.restaurantName}. Tüm Hakları Saklıdır.</p>
          <span className="footer-designer-sign">Tasarım & Altyapı: Next.js + Google Firebase</span>
        </div>
      </footer>

      {/* 📜 PREMIUM GLASSMORPHIC LEGAL MODAL OVERLAY */}
      {activeDocId && (
        <div className="legal-modal-overlay" onClick={closeLegalModal}>
          <div className="legal-modal-container glass-card animate-zoom" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="legal-modal-header">
              <div>
                <span className="legal-modal-subtitle">CİĞERCİ NEŞET</span>
                <h2 className="legal-modal-title gold-text">{modalTitle}</h2>
              </div>
              <button className="legal-modal-close-btn" onClick={closeLegalModal} aria-label="Kapat">
                ✕
              </button>
            </div>
            
            <div className="legal-modal-divider"></div>

            {/* Modal Content */}
            <div className="legal-modal-body">
              {modalLoading ? (
                <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
                  <div className="menu-spinner" style={{ margin: "0 auto 1.5rem auto" }}></div>
                  <p className="gold-text">Veriler yükleniyor...</p>
                </div>
              ) : (
                <div className="legal-modal-paragraphs">
                  {modalContent.split("\n").map((para, idx) => {
                    if (!para.trim()) return null;
                    return (
                      <p key={idx} className="legal-modal-para">
                        {para}
                      </p>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="legal-modal-footer">
              <span className="legal-modal-date">© {new Date().getFullYear()} Yasal Metin Bilgilendirmesi</span>
              <button className="btn btn-primary" onClick={closeLegalModal}>Okudum, Anladım 👍</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
