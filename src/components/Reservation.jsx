"use client";
import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import "./Reservation.css";

export default function Reservation() {
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    guestCount: 2,
    date: "",
    time: "",
    notes: ""
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

    // Simple validations
    if (!formData.customerName || !formData.customerPhone || !formData.date || !formData.time) {
      setError("Lütfen yıldızlı (*) zorunlu alanları doldurunuz.");
      setSubmitting(false);
      return;
    }

    try {
      await addDoc(collection(db, "reservations"), {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        guestCount: parseInt(formData.guestCount),
        date: formData.date,
        time: formData.time,
        notes: formData.notes,
        status: "beklemede",
        createdAt: new Date().toISOString()
      });

      setSuccess(true);
      setSubmitting(false);
      // Reset form
      setFormData({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        guestCount: 2,
        date: "",
        time: "",
        notes: ""
      });
    } catch (err) {
      console.error("Rezervasyon ekleme hatası:", err);
      setError("Rezervasyon kaydedilirken sistemsel bir hata oluştu. Lütfen telefonla iletişime geçin.");
      setSubmitting(false);
    }
  };

  return (
    <section id="reservation" className="reservation-section">
      {/* Background Graphic */}
      <div className="reservation-bg-overlay"></div>
      
      <div className="section-container">
        
        {/* Title */}
        <div className="section-title-wrapper">
          <span className="section-subtitle">MASANIZI AYIRTIN</span>
          <h2 className="section-title">Ocakbaşında Yeriniz Hazır</h2>
        </div>

        <div className="reservation-container">
          {success ? (
            <div className="reservation-success-card glass-card text-center animate-success">
              <div className="success-icon-wrapper">
                <span className="success-icon">🔥</span>
              </div>
              <h3 className="success-title gold-text">Rezervasyonunuz Alındı!</h3>
              <p className="success-text">
                Neşet Usta ocakbaşını sizin için hazırlıyor! Rezervasyon talebiniz başarıyla kaydedilmiştir. 
                Belirttiğiniz telefon numarasından en kısa sürede onay araması gerçekleştirilecektir.
              </p>
              <button className="btn btn-primary btn-success-back" onClick={() => setSuccess(false)}>
                Yeni Rezervasyon Talebi 📅
              </button>
            </div>
          ) : (
            <div className="reservation-card-wrapper glass-card">
              <div className="reservation-info-pane">
                <h3 className="pane-title">Ciğerci Neşet Lezzet Ritüeli</h3>
                <p className="pane-description">
                  Diyarbakır'ın otantik lezzetini sıcacık ocakbaşı eşliğinde deneyimlemek için masanızı ayırtın.
                </p>
                <div className="pane-details">
                  <div className="pane-detail-item">
                    <span className="detail-icon">📞</span>
                    <div>
                      <h4>Telefonla İletişim</h4>
                      <p>+90 (412) 222 21 21</p>
                    </div>
                  </div>
                  <div className="pane-detail-item">
                    <span className="detail-icon">🕒</span>
                    <div>
                      <h4>Çalışma Saatleri</h4>
                      <p>Hafta İçi & Hafta Sonu: 08:00 - 02:00</p>
                    </div>
                  </div>
                  <div className="pane-detail-item">
                    <span className="detail-icon">📍</span>
                    <div>
                      <h4>Adres</h4>
                      <p>Tarihi Suriçi, Gazi Caddesi No: 47, Sur / Diyarbakır</p>
                    </div>
                  </div>
                </div>
                <div className="pane-motto-badge">
                  <span>❖ Hakiki Odun Ateşinde Ağır Ağır...</span>
                </div>
              </div>

              {/* Form Pane */}
              <form className="reservation-form" onSubmit={handleSubmit}>
                <h3 className="form-pane-title gold-text">Rezervasyon Formu</h3>
                
                {error && (
                  <div className="form-error-banner">
                    <span>⚠</span> {error}
                  </div>
                )}

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="customerName">Adınız Soyadınız *</label>
                    <input
                      type="text"
                      id="customerName"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      placeholder="Ahmet Yılmaz"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="customerPhone">Telefon Numaranız *</label>
                    <input
                      type="tel"
                      id="customerPhone"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleChange}
                      placeholder="0532 XXX XX XX"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="customerEmail">E-Posta Adresiniz</label>
                    <input
                      type="email"
                      id="customerEmail"
                      name="customerEmail"
                      value={formData.customerEmail}
                      onChange={handleChange}
                      placeholder="ahmet@email.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="guestCount">Kişi Sayısı</label>
                    <select
                      id="guestCount"
                      name="guestCount"
                      value={formData.guestCount}
                      onChange={handleChange}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={num}>{num} Kişi</option>
                      ))}
                      <option value="11">10+ Kişi (Grup)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="date">Tarih Seçin *</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="time">Saat Seçin *</label>
                    <select
                      id="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Saat Seçiniz</option>
                      {["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="notes">Özel İstekler / Notlar</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Ocakbaşı yanı, pencere kenarı, bebek sandalyesi vb. özel taleplerinizi iletebilirsiniz..."
                    rows="3"
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-accent btn-submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="submit-spinner"></span> Kaydediliyor...
                    </>
                  ) : (
                    "Rezervasyonu Tamamla 🔥"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
