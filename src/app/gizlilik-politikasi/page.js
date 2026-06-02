import React from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import Navbar from "../../components/Navbar";

export const metadata = {
  title: "Gizlilik Politikası | Ciğerci Neşet",
  description: "Ciğerci Neşet web sitesi Gizlilik Politikası ve veri güvenliği koşulları."
};

export default async function PrivacyPolicyPage() {
  let docData = {
    title: "Gizlilik Politikası",
    content: "Yükleniyor..."
  };

  try {
    const docRef = doc(db, "legal", "privacy_policy");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      docData = docSnap.data();
    }
  } catch (err) {
    console.error("Gizlilik politikası yüklenemedi:", err);
  }

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
