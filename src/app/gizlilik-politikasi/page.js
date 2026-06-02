"use client";
import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import Navbar from "../../components/Navbar";

export default function PrivacyPolicyPage() {
  const [docData, setDocData] = useState({
    title: "Gizlilik Politikası",
    content: ""
  });
  const [loading, setLoading] = useState(true);

  const fallbackContent = `Ciğerci Neşet olarak, web sitemizi ziyaret eden misafirlerimizin kişisel verilerinin korunmasına ve gizliliğine son derece önem veriyoruz. Bu Gizlilik Politikası, sitemiz üzerinden toplanan bilgilerin nasıl kullanıldığını ve korunduğunu açıklamaktadır.

1. Toplanan Veriler:
Web sitemiz üzerinden masa rezervasyonu yaptığınızda veya iletişim formunu doldurduğunuzda; adınız soyadınız, telefon numaranız, e-posta adresiniz ve rezervasyon notlarınız gibi bilgiler toplanmaktadır.

2. Verilerin Kullanım Amacı:
Toplanan kişisel verileriniz, sadece masa rezervasyonunuzun doğrulanması, taleplerinizin yanıtlanması ve sizlere daha iyi bir ocakbaşı hizmeti sunulabilmesi amacıyla kullanılmaktadır. Bilgileriniz kesinlikle üçüncü şahıslarla paylaşılmaz veya ticari amaçla satılmaz.

3. Güvenlik:
Verileriniz güvenli Google Cloud ve Firebase sunucularında depolanmakta olup, yetkisiz erişimleri engellemek için gerekli tüm teknik ve idari güvenlik önlemleri alınmıştır.`;

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const docRef = doc(db, "legal", "privacy_policy");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDocData(docSnap.data());
        } else {
          setDocData({
            title: "Gizlilik Politikası",
            content: fallbackContent
          });
        }
      } catch (err) {
        console.error("Gizlilik politikası yüklenemedi, yerel metin yükleniyor:", err);
        setDocData({
          title: "Gizlilik Politikası",
          content: fallbackContent
        });
      }
      setLoading(false);
    };

    fetchDoc();
  }, []);

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: "#090807", minHeight: "100vh", paddingTop: "140px", paddingBottom: "80px" }}>
        <div style={{ maxWidth: "850px", margin: "0 auto", padding: "0 1.5rem" }}>
          <div className="glass-card animate-zoom" style={{ padding: "4rem 3rem", border: "1px solid rgba(212, 175, 55, 0.15)", borderRadius: "12px", background: "rgba(20, 18, 16, 0.55)" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: "700" }}>CİĞERCİ NEŞET</span>
            <h1 className="gold-text" style={{ fontSize: "2.5rem", marginTop: "0.5rem", marginBottom: "1.5rem", fontFamily: "var(--font-display)" }}>
              {docData.title}
            </h1>
            <div style={{ width: "60px", height: "2.5px", background: "var(--color-primary)", boxShadow: "0 0 8px var(--color-primary)", marginBottom: "2.5rem" }}></div>
            
            {loading ? (
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <div className="menu-spinner" style={{ margin: "0 auto 1.5rem auto" }}></div>
                <p className="gold-text">Yasal metin yükleniyor...</p>
              </div>
            ) : (
              <div className="legal-paragraphs-wrapper" style={{ textIndent: "0" }}>
                {docData.content.split("\n").map((paragraph, index) => {
                  if (!paragraph.trim()) return null;
                  return (
                    <p key={index} style={{ color: "var(--color-text-muted)", fontSize: "1.05rem", lineHeight: "1.8", marginBottom: "1.5rem", textAlign: "justify" }}>
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            )}

            <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <a href="/" style={{ color: "var(--color-primary)", textDecoration: "none", fontSize: "0.9rem", fontWeight: "600" }}>← Sitede Gezinmeye Dön</a>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.8rem" }}>Son Güncelleme: 2026</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer-pane">
        <div className="footer-bottom" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "2rem 0", textAlign: "center" }}>
          <p>© {new Date().getFullYear()} Ciğerci Neşet. Tüm Hakları Saklıdır.</p>
        </div>
      </footer>
    </>
  );
}
