"use client";
import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import "./Contact.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!formData.name || !formData.email || !formData.message) {
      setError("Lütfen zorunlu alanları (Ad, E-Posta, Mesaj) doldurunuz.");
      setSubmitting(false);
      return;
    }

    try {
      await addDoc(collection(db, "messages"), {
        name: formData.name,
        email: formData.email,
        subject: formData.subject || "Genel İletişim",
        message: formData.message,
        createdAt: new Date().toISOString()
      });

      setSuccess(true);
      setSubmitting(false);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error("Mesaj kaydetme hatası:", err);
      setError("Mesajınız iletilirken sistemsel bir hata oluştu.");
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="contact-section">
      <div className="section-container">
        
        {/* Title */}
        <div className="section-title-wrapper">
          <span className="section-subtitle">BİZE ULAŞIN</span>
          <h2 className="section-title">İletişim & Lokasyon</h2>
        </div>

        <div className="contact-grid">
          
          {/* Details Column */}
          <div className="contact-details-column">
            <h3 className="contact-column-title gold-text">Ciğerci Neşet</h3>
            <p className="contact-column-desc">
              Görüş, öneri ve toplu organizasyon talepleriniz için bizimle iletişime geçebilirsiniz. 
              Sizi ve sevdiklerinizi ağırlamaktan onur duyarız.
            </p>

            <div className="contact-items-list">
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <div>
                  <h4>Mekan Lokasyonu</h4>
                  <p>Tarihi Suriçi, Gazi Caddesi No: 47, Sur / Diyarbakır</p>
                </div>
              </div>

              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <div>
                  <h4>Telefon Numaramız</h4>
                  <p>+90 (412) 222 21 21</p>
                </div>
              </div>

              <div className="contact-item">
                <span className="contact-icon">✉</span>
                <div>
                  <h4>E-Posta Adresi</h4>
                  <p>info@cigercineset.com</p>
                </div>
              </div>

              <div className="contact-item">
                <span className="contact-icon">🕒</span>
                <div>
                  <h4>Açılış / Kapanış Saatleri</h4>
                  <p>Her Gün: 08:00 - Gece 02:00</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="contact-social-wrapper">
              <a href="#" className="social-icon-btn" aria-label="Instagram">📸</a>
              <a href="#" className="social-icon-btn" aria-label="Facebook">🔵</a>
              <a href="#" className="social-icon-btn" aria-label="YouTube">🔴</a>
              <a href="#" className="social-icon-btn" aria-label="TripAdvisor">🦉</a>
            </div>
          </div>

          {/* Message Form Column */}
          <div className="contact-form-column">
            <div className="contact-form-card glass-card">
              <h3 className="form-card-title">Bize Mesaj Bırakın</h3>
              
              {success && (
                <div className="contact-success-banner animate-success">
                  <span>✔</span> Mesajınız başarıyla iletildi. En kısa sürede döneceğiz!
                </div>
              )}

              {error && (
                <div className="contact-error-banner">
                  <span>⚠</span> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-message-form">
                <div className="form-group">
                  <label htmlFor="name">Adınız Soyadınız *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Kadir Korkmaz"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">E-Posta Adresiniz *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="kadir@email.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Konu</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Grup Yemeği, Öneri, Şikayet vb."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Mesajınız *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Bize iletmek istediğiniz detaylı mesajınızı yazınız..."
                    rows="4"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary btn-contact-submit" disabled={submitting}>
                  {submitting ? "Gönderiliyor..." : "Mesajı Gönder ✉"}
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Live Interactive Map Mapbox/OpenStreetMap Container */}
        <div className="contact-map-wrapper glass-card">
          <div className="map-title-wrapper">
            <span className="map-logo-bullet">❖</span>
            <h3>Diyarbakır Suriçi Tarihi Gazi Caddesi Gaziantep ve Mardin Yolu Bağlantısı</h3>
          </div>
          <iframe 
            src="https://www.openstreetmap.org/export/embed.html?bbox=40.228%2C37.906%2C40.245%2C37.918&amp;layer=mapnik&amp;marker=37.912%2C40.237"
            className="contact-map-iframe"
            title="Ciğerci Neşet Suriçi Harita Lokasyonu"
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>

      </div>
    </section>
  );
}
