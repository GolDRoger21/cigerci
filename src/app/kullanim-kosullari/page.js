"use client";
import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function TermsOfUsePage() {
  const [docData, setDocData] = useState({
    title: "Kullanım Koşulları",
    content: ""
  });
  const [loading, setLoading] = useState(true);

  const fallbackContent = `Ciğerci Neşet web sitesine hoş geldiniz. Sitemizi kullanarak aşağıda belirtilen kullanım koşullarını kabul etmiş sayılmaktasınız.

1. Hizmet Kapsamı:
Bu web sitesi, Ciğerci Neşet restoranının menüsünü incelemek, online masa rezervasyon talebi oluşturmak ve restoranımızla iletişim kurmak amacıyla hazırlanmıştır.

2. Rezervasyon Kuralları:
Sitemiz üzerinden yapılan rezervasyonlar bir ön talep niteliğindedir. Rezervasyonunuz, ekibimiz tarafından telefonla aranarak onaylanmadığı sürece kesinleşmiş sayılmaz. Yoğun günlerde rezervasyon saatinden 15 dakika sonra gelmeyen misafirlerimizin masaları iptal edilebilir.

3. Fikri Mülkiyet:
Sitede yer alan tüm logolar, grafikler, iştah açıcı görseller ve metinler Ciğerci Neşet'in fikri mülkiyetindedir. İzinsiz kopyalanması veya ticari amaçla kullanılması yasaktır.`;

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const docRef = doc(db, "legal", "terms_of_use");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDocData(docSnap.data());
        } else {
          setDocData({
            title: "Kullanım Koşulları",
            content: fallbackContent
          });
        }
      } catch (err) {
        console.error("Kullanım koşulları yüklenemedi, yerel metin yükleniyor:", err);
        setDocData({
          title: "Kullanım Koşulları",
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

            <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <a href="/" className="btn btn-primary" style={{ textDecoration: "none", fontSize: "0.9rem" }}>
                ← Anasayfaya Geri Dön
              </a>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.85rem" }}>Son Güncelleme: {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
