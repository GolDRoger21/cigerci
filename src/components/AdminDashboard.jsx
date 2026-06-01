"use client";
import React, { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passError, setPassError] = useState("");
  const [activeTab, setActiveTab] = useState("reservations");

  // Collections state
  const [reservations, setReservations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Authenticate
  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode === "2121" || passcode === "neset21") {
      setIsAuthenticated(true);
      setPassError("");
      fetchData();
    } else {
      setPassError("Hatalı yönetici şifresi! Tekrar deneyin.");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Reservations
      const resQuery = query(collection(db, "reservations"), orderBy("createdAt", "desc"));
      const resSnapshot = await getDocs(resQuery);
      const resItems = [];
      resSnapshot.forEach((docSnap) => {
        resItems.push({ id: docSnap.id, ...docSnap.data() });
      });
      setReservations(resItems);

      // Fetch Reviews
      const revQuery = query(collection(db, "reviews"), orderBy("date", "desc"));
      const revSnapshot = await getDocs(revQuery);
      const revItems = [];
      revSnapshot.forEach((docSnap) => {
        revItems.push({ id: docSnap.id, ...docSnap.data() });
      });
      setReviews(revItems);

      // Fetch Messages
      const msgQuery = query(collection(db, "messages"), orderBy("createdAt", "desc"));
      const msgSnapshot = await getDocs(msgQuery);
      const msgItems = [];
      msgSnapshot.forEach((docSnap) => {
        msgItems.push({ id: docSnap.id, ...docSnap.data() });
      });
      setMessages(msgItems);

      setLoading(false);
    } catch (err) {
      console.error("Yönetim verisi çekilemedi:", err);
      setLoading(false);
    }
  };

  // Update Reservation Status
  const handleUpdateResStatus = async (id, newStatus) => {
    setActionLoading(true);
    try {
      const docRef = doc(db, "reservations", id);
      await updateDoc(docRef, { status: newStatus });
      
      // Update local state
      setReservations(prev => 
        prev.map(res => res.id === id ? { ...res, status: newStatus } : res)
      );
    } catch (err) {
      console.error("Durum güncellenemedi:", err);
    }
    setActionLoading(false);
  };

  // Toggle Review Approval Status
  const handleToggleReviewApproval = async (id, currentApproved) => {
    setActionLoading(true);
    try {
      const docRef = doc(db, "reviews", id);
      await updateDoc(docRef, { isApproved: !currentApproved });
      
      // Update local state
      setReviews(prev => 
        prev.map(rev => rev.id === id ? { ...rev, isApproved: !currentApproved } : rev)
      );
    } catch (err) {
      console.error("Yorum durumu güncellenemedi:", err);
    }
    setActionLoading(false);
  };

  // Delete Item (generic)
  const handleDeleteItem = async (colName, id) => {
    if (!window.confirm("Bu kaydı kalıcı olarak silmek istediğinize emin misiniz?")) return;
    setActionLoading(true);
    try {
      await deleteDoc(doc(db, colName, id));
      
      // Update local state
      if (colName === "reservations") {
        setReservations(prev => prev.filter(item => item.id !== id));
      } else if (colName === "reviews") {
        setReviews(prev => prev.filter(item => item.id !== id));
      } else if (colName === "messages") {
        setMessages(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error("Kayıt silinemedi:", err);
    }
    setActionLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-screen">
        <div className="login-box glass-card animate-zoom">
          <span className="login-logo-icon">❖</span>
          <h2 className="login-title">Ciğerci Neşet</h2>
          <p className="login-subtitle">Yönetici Paneli Girişi</p>
          
          {passError && (
            <div className="login-error-alert">
              <span>⚠</span> {passError}
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="passcode">Şifre (Passcode) *</label>
              <input
                type="password"
                id="passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Yönetici şifrenizi girin..."
                required
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary btn-login-submit">
              Giriş Yap 🔥
            </button>
            <p className="login-help-hint">İpucu: neset21 veya 2121 giriniz.</p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-wrapper">
      {/* Header Banner */}
      <div className="admin-header glass-card">
        <div className="admin-header-logo">
          <span>❖</span>
          <h2>Ciğerci Neşet <span className="gold-text">Yönetim Masası</span></h2>
        </div>
        <div className="admin-header-actions">
          <button className="btn btn-secondary btn-header-refresh" onClick={fetchData} disabled={loading || actionLoading}>
            🗘 Verileri Yenile
          </button>
          <button className="btn btn-accent btn-header-logout" onClick={() => setIsAuthenticated(false)}>
            Çıkış Yap ✕
          </button>
        </div>
      </div>

      {/* Tabs list */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab-btn ${activeTab === "reservations" ? "active" : ""}`}
          onClick={() => setActiveTab("reservations")}
        >
          📅 Rezervasyonlar ({reservations.length})
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === "reviews" ? "active" : ""}`}
          onClick={() => setActiveTab("reviews")}
        >
          💬 Yorumlar ({reviews.length})
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === "messages" ? "active" : ""}`}
          onClick={() => setActiveTab("messages")}
        >
          ✉ Mesajlar ({messages.length})
        </button>
      </div>

      {/* Main Panel Content */}
      <div className="admin-content-pane glass-card">
        {loading ? (
          <div className="admin-loading-indicator">
            <div className="menu-spinner"></div>
            <p>Yönetici verileri yükleniyor, lütfen bekleyin...</p>
          </div>
        ) : (
          <div className="tab-table-container">
            {/* 1. RESERVATIONS PANEL */}
            {activeTab === "reservations" && (
              <div className="reservations-table-wrapper">
                <h3 className="tab-pane-title">Gelen Masa Rezervasyonları</h3>
                {reservations.length === 0 ? (
                  <p className="no-data-hint">Henüz hiçbir rezervasyon kaydı bulunamadı.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Müşteri Bilgileri</th>
                          <th>Tarih & Saat</th>
                          <th>Kişi</th>
                          <th>Özel İstek</th>
                          <th>Durum</th>
                          <th>İşlemler</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservations.map((res) => (
                          <tr key={res.id} className={`status-row-${res.status}`}>
                            <td>
                              <div className="table-customer-cell">
                                <strong className="customer-cell-name">{res.customerName}</strong>
                                <span className="customer-cell-phone">📞 {res.customerPhone}</span>
                                {res.customerEmail && <span className="customer-cell-email">✉ {res.customerEmail}</span>}
                              </div>
                            </td>
                            <td>
                              <div className="table-datetime-cell">
                                <span className="cell-date">📅 {res.date}</span>
                                <strong className="cell-time">🕒 {res.time}</strong>
                              </div>
                            </td>
                            <td>
                              <span className="guest-badge">{res.guestCount} Kişi</span>
                            </td>
                            <td>
                              <p className="table-notes-text">{res.notes || "-"}</p>
                            </td>
                            <td>
                              <span className={`status-badge badge-${res.status}`}>
                                {res.status === "beklemede" && "⌛ Beklemede"}
                                {res.status === "onaylandi" && "✔ Onaylandı"}
                                {res.status === "iptal" && "❌ İptal Edildi"}
                                {res.status === "tamamlandı" && "🏁 Tamamlandı"}
                              </span>
                            </td>
                            <td>
                              <div className="table-actions-cell">
                                {res.status === "beklemede" && (
                                  <>
                                    <button 
                                      className="action-btn btn-table-approve"
                                      onClick={() => handleUpdateResStatus(res.id, "onaylandi")}
                                      disabled={actionLoading}
                                    >
                                      Onayla
                                    </button>
                                    <button 
                                      className="action-btn btn-table-reject"
                                      onClick={() => handleUpdateResStatus(res.id, "iptal")}
                                      disabled={actionLoading}
                                    >
                                      İptal Et
                                    </button>
                                  </>
                                )}
                                {res.status === "onaylandi" && (
                                  <button 
                                    className="action-btn btn-table-complete"
                                    onClick={() => handleUpdateResStatus(res.id, "tamamlandı")}
                                    disabled={actionLoading}
                                  >
                                    Tamamla
                                  </button>
                                )}
                                <button 
                                  className="action-btn btn-table-delete"
                                  onClick={() => handleDeleteItem("reservations", res.id)}
                                  disabled={actionLoading}
                                >
                                  Sil
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 2. REVIEWS PANEL */}
            {activeTab === "reviews" && (
              <div className="reviews-table-wrapper">
                <h3 className="tab-pane-title">Ziyaretçi Değerlendirmeleri</h3>
                {reviews.length === 0 ? (
                  <p className="no-data-hint">Henüz hiçbir yorum kaydı bulunamadı.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Ziyaretçi</th>
                          <th>Puan</th>
                          <th>Yorum</th>
                          <th>Tarih</th>
                          <th>Yayın Durumu</th>
                          <th>İşlemler</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reviews.map((rev) => (
                          <tr key={rev.id}>
                            <td>
                              <strong>{rev.userName}</strong>
                            </td>
                            <td>
                              <span className="admin-stars gold-text">{"★".repeat(rev.rating)}</span>
                            </td>
                            <td>
                              <p className="table-comment-text">"{rev.comment}"</p>
                            </td>
                            <td>
                              <span className="cell-date">
                                {new Date(rev.date).toLocaleDateString("tr-TR")}
                              </span>
                            </td>
                            <td>
                              <span className={`status-badge badge-${rev.isApproved ? "approved" : "pending"}`}>
                                {rev.isApproved ? "✔ Yayında" : "⌛ Beklemede"}
                              </span>
                            </td>
                            <td>
                              <div className="table-actions-cell">
                                <button 
                                  className={`action-btn ${rev.isApproved ? "btn-table-reject" : "btn-table-approve"}`}
                                  onClick={() => handleToggleReviewApproval(rev.id, rev.isApproved)}
                                  disabled={actionLoading}
                                >
                                  {rev.isApproved ? "Kaldır" : "Yayınla"}
                                </button>
                                <button 
                                  className="action-btn btn-table-delete"
                                  onClick={() => handleDeleteItem("reviews", rev.id)}
                                  disabled={actionLoading}
                                >
                                  Sil
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 3. MESSAGES PANEL */}
            {activeTab === "messages" && (
              <div className="messages-table-wrapper">
                <h3 className="tab-pane-title">İletişim Mesajları</h3>
                {messages.length === 0 ? (
                  <p className="no-data-hint">Herhangi bir yeni iletişim mesajı bulunmamaktadır.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Gönderen</th>
                          <th>Konu</th>
                          <th>Mesaj İçeriği</th>
                          <th>Gönderim Tarihi</th>
                          <th>İşlemler</th>
                        </tr>
                      </thead>
                      <tbody>
                        {messages.map((msg) => (
                          <tr key={msg.id}>
                            <td>
                              <div className="table-customer-cell">
                                <strong>{msg.name}</strong>
                                <span className="customer-cell-email">{msg.email}</span>
                              </div>
                            </td>
                            <td>
                              <strong>{msg.subject || "Genel İletişim"}</strong>
                            </td>
                            <td>
                              <p className="table-notes-text message-text-desc">{msg.message}</p>
                            </td>
                            <td>
                              <span className="cell-date">
                                {new Date(msg.createdAt).toLocaleString("tr-TR")}
                              </span>
                            </td>
                            <td>
                              <div className="table-actions-cell">
                                <button 
                                  className="action-btn btn-table-delete"
                                  onClick={() => handleDeleteItem("messages", msg.id)}
                                  disabled={actionLoading}
                                >
                                  Sil Mesajı
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
