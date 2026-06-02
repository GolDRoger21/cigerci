"use client";
import React, { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  getDoc, 
  setDoc 
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { db, auth } from "../firebase/config";
import { getDirectImageUrl } from "../firebase/imageHelper";
import "./AdminDashboard.css";

// Human-readable labels for menu category slugs (shared by the menu grid & filters)
const MENU_CATEGORY_LABELS = {
  cigerler: "CİĞERLER",
  kebaplar: "KEBAPLAR",
  mezeler: "MEZELER & İKRAMLAR",
  tatlilar: "TATLILAR",
  icecekler: "İÇECEKLER",
};

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [passError, setPassError] = useState("");
  const [activeTab, setActiveTab] = useState("reservations");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Database Collections state
  const [reservations, setReservations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [messages, setMessages] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  
  // Site Configuration state
  const [siteSettings, setSiteSettings] = useState({
    restaurantName: "Ciğerci Neşet",
    slogan: "Diyarbakır'ın Kadim Tarihinden, Ocakbaşı Sıcaklığıyla Sofranıza...",
    announcementActive: true,
    announcementText: "",
    heroVideoUrl: "https://cdn.jsdelivr.net/gh/GolDRoger21/cigerci@main/public/Bu%20lezzeti%20herkesin%20tatmas%C4%B1n%C4%B1%20isteriz.mp4",
    phone: "",
    email: "",
    address: "",
    workingHours: "",
    mottoHighlight: "",
    mapUrl: "",
    instagramUrl: "",
    facebookUrl: "",
    youtubeUrl: "",
    tripadvisorUrl: "",
    reservationsEnabled: true,
    reservationsDisabledMessage: "",
    maxGuestsPerSlot: 10
  });

  // Filter & Search states
  const [searchRes, setSearchRes] = useState("");
  const [filterResStatus, setFilterResStatus] = useState("all");
  
  const [searchRev, setSearchRev] = useState("");
  const [filterRevStatus, setFilterRevStatus] = useState("all");
  const [filterRevRating, setFilterRevRating] = useState("all");
  
  const [searchMenu, setSearchMenu] = useState("");
  const [filterMenuCategory, setFilterMenuCategory] = useState("all");

  // Edit / Add Modals & Form states
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null); // null means "Add New"
  const [menuForm, setMenuForm] = useState({
    name: "",
    category: "cigerler",
    description: "",
    price: 0,
    tag: "",
    isAvailable: true,
    order: 10,
    imageUrl: ""
  });

  // Settings change form state
  const [settingsForm, setSettingsForm] = useState({ ...siteSettings });
  
  // Account security feedback (Firebase Auth password reset)
  const [passwordMessage, setPasswordMessage] = useState({ text: "", type: "" });

  // Yasal Metinler state'leri
  const [activeLegalDoc, setActiveLegalDoc] = useState("privacy_policy");
  const [legalLoading, setLegalLoading] = useState(false);
  const [legalForm, setLegalForm] = useState({
    id: "privacy_policy",
    title: "Gizlilik Politikası",
    content: ""
  });

  // Fetch the selected legal doc from Firestore
  const handleSelectLegalDoc = async (docId) => {
    setActiveLegalDoc(docId);
    setLegalLoading(true);
    try {
      const docRef = doc(db, "legal", docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLegalForm({
          id: docId,
          title: data.title || "",
          content: data.content || ""
        });
      }
    } catch (err) {
      console.error("Yasal metin yükleme hatası:", err);
    }
    setLegalLoading(false);
  };

  useEffect(() => {
    if (activeTab === "legal") {
      handleSelectLegalDoc("privacy_policy");
    }
  }, [activeTab]);

  const handleLegalSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const docRef = doc(db, "legal", legalForm.id);
      await setDoc(docRef, {
        id: legalForm.id,
        title: legalForm.title,
        content: legalForm.content,
        updatedAt: new Date().toISOString(),
      });
      alert(`${legalForm.title} başarıyla güncellendi ve sitede yayına alındı! 📜`);
    } catch (err) {
      console.error("Yasal metin kaydetme hatası:", err);
      alert("Metin kaydedilirken hata oluştu! Yetkisiz istek.");
    }
    setActionLoading(false);
  };

  // Firebase Auth gates the admin panel. Session persistence is handled by the
  // Firebase SDK, so onAuthStateChanged restores the session on reload.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setAdminEmail(user.email || "");
        fetchData();
      } else {
        setIsAuthenticated(false);
        setAdminEmail("");
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setPassError("");
    try {
      await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword);
      // onAuthStateChanged takes over from here (sets auth state + loads data).
      setLoginPassword("");
    } catch (err) {
      console.error("Giriş başarısız:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setPassError("Hatalı e-posta veya şifre! Tekrar deneyin.");
      } else if (err.code === "auth/too-many-requests") {
        setPassError("Çok fazla başarısız deneme. Lütfen biraz sonra tekrar deneyin.");
      } else if (err.code === "auth/invalid-email") {
        setPassError("Geçersiz e-posta adresi.");
      } else {
        setPassError("Giriş yapılamadı. Bağlantınızı kontrol edin.");
      }
    }
    setActionLoading(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Çıkış hatası:", err);
    }
    setIsAuthenticated(false);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Reservations
      const resQuery = query(collection(db, "reservations"), orderBy("createdAt", "desc"));
      const resSnapshot = await getDocs(resQuery);
      const resItems = [];
      resSnapshot.forEach((docSnap) => {
        resItems.push({ id: docSnap.id, ...docSnap.data() });
      });
      setReservations(resItems);

      // 2. Fetch Reviews
      const revQuery = query(collection(db, "reviews"), orderBy("date", "desc"));
      const revSnapshot = await getDocs(revQuery);
      const revItems = [];
      revSnapshot.forEach((docSnap) => {
        revItems.push({ id: docSnap.id, ...docSnap.data() });
      });
      setReviews(revItems);

      // 3. Fetch Messages
      const msgQuery = query(collection(db, "messages"), orderBy("createdAt", "desc"));
      const msgSnapshot = await getDocs(msgQuery);
      const msgItems = [];
      msgSnapshot.forEach((docSnap) => {
        msgItems.push({ id: docSnap.id, ...docSnap.data() });
      });
      setMessages(msgItems);

      // 4. Fetch Menu items
      const menuQuery = query(collection(db, "menu"), orderBy("order", "asc"));
      const menuSnapshot = await getDocs(menuQuery);
      const menuItemsList = [];
      menuSnapshot.forEach((docSnap) => {
        menuItemsList.push({ id: docSnap.id, ...docSnap.data() });
      });
      setMenuItems(menuItemsList);

      // 5. Fetch Settings
      const docRef = doc(db, "settings", "site_config");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSiteSettings(docSnap.data());
        setSettingsForm(docSnap.data());
      }

      setLoading(false);
    } catch (err) {
      console.error("Yönetim verisi çekilemedi:", err);
      setLoading(false);
    }
  };

  // 1. RESERVATIONS - Update Status (writes gated by Firebase Auth in firestore.rules)
  const handleUpdateResStatus = async (id, newStatus) => {
    setActionLoading(true);
    try {
      const docRef = doc(db, "reservations", id);
      await updateDoc(docRef, { status: newStatus });
      
      setReservations(prev => 
        prev.map(res => res.id === id ? { ...res, status: newStatus } : res)
      );
    } catch (err) {
      console.error("Rezervasyon güncellenemedi:", err);
      alert("İşlem yetkisiz veya bağlantı hatası oluştu!");
    }
    setActionLoading(false);
  };

  // 2. REVIEWS - Approve status change (writes gated by Firebase Auth)
  const handleToggleReviewApproval = async (id, currentApproved) => {
    setActionLoading(true);
    try {
      const docRef = doc(db, "reviews", id);
      await updateDoc(docRef, { isApproved: !currentApproved });
      
      setReviews(prev => 
        prev.map(rev => rev.id === id ? { ...rev, isApproved: !currentApproved } : rev)
      );
    } catch (err) {
      console.error("Yorum güncellenemedi:", err);
      alert("İşlem yetkisiz veya bağlantı hatası oluştu!");
    }
    setActionLoading(false);
  };

  // 3. GENERIC DELETE - deletes are gated by Firebase Auth in firestore.rules
  const handleDeleteItem = async (colName, id) => {
    if (!window.confirm("Bu kaydı kalıcı olarak silmek istediğinize emin misiniz?")) return;
    setActionLoading(true);
    try {
      const docRef = doc(db, colName, id);
      await deleteDoc(docRef);
      
      // Update local state
      if (colName === "reservations") {
        setReservations(prev => prev.filter(item => item.id !== id));
      } else if (colName === "reviews") {
        setReviews(prev => prev.filter(item => item.id !== id));
      } else if (colName === "messages") {
        setMessages(prev => prev.filter(item => item.id !== id));
      } else if (colName === "menu") {
        setMenuItems(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error("Kayıt silinemedi:", err);
      alert("Silme yetkiniz yok veya bağlantı hatası!");
    }
    setActionLoading(false);
  };

  // 4. MENU ITEMS - CRUD
  const openMenuModal = (item = null) => {
    if (item) {
      setEditingMenuItem(item);
      setMenuForm({
        name: item.name || "",
        category: item.category || "cigerler",
        description: item.description || "",
        price: item.price || 0,
        tag: item.tag || "",
        isAvailable: item.isAvailable !== false,
        order: item.order || 10,
        imageUrl: item.imageUrl || ""
      });
    } else {
      setEditingMenuItem(null);
      setMenuForm({
        name: "",
        category: "cigerler",
        description: "",
        price: 0,
        tag: "",
        isAvailable: true,
        order: menuItems.length + 1,
        imageUrl: ""
      });
    }
    setMenuModalOpen(true);
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const parsedImageUrl = getDirectImageUrl(menuForm.imageUrl);
      const menuData = {
        name: menuForm.name,
        category: menuForm.category,
        description: menuForm.description,
        price: parseFloat(menuForm.price),
        tag: menuForm.tag,
        isAvailable: menuForm.isAvailable,
        order: parseInt(menuForm.order),
        imageUrl: parsedImageUrl,
      };

      if (editingMenuItem) {
        // UPDATE
        const docRef = doc(db, "menu", editingMenuItem.id);
        await updateDoc(docRef, menuData);
        setMenuItems(prev => 
          prev.map(item => item.id === editingMenuItem.id ? { ...item, ...menuData } : item)
        );
      } else {
        // CREATE NEW
        // Create custom slug/id from name
        const id = menuForm.name.toLowerCase()
          .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
          .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
          
        const docRef = doc(db, "menu", id);
        // Using setDoc with custom id
        await setDoc(docRef, menuData);
        setMenuItems(prev => [...prev, { id, ...menuData }].sort((a, b) => a.order - b.order));
      }
      
      setMenuModalOpen(false);
    } catch (err) {
      console.error("Menü ögesi kaydedilemedi:", err);
      alert("Menü kaydedilirken hata oluştu. Lütfen şifrenizin ve internet bağlantınızın doğruluğunu kontrol edin.");
    }
    setActionLoading(false);
  };

  const handleToggleMenuAvailability = async (item) => {
    setActionLoading(true);
    try {
      const docRef = doc(db, "menu", item.id);
      await updateDoc(docRef, { isAvailable: !item.isAvailable });
      setMenuItems(prev => 
        prev.map(m => m.id === item.id ? { ...m, isAvailable: !item.isAvailable } : m)
      );
    } catch (err) {
      console.error("Menü mevcudiyeti güncellenemedi:", err);
      alert("Hata oluştu! Yetkisiz istek.");
    }
    setActionLoading(false);
  };

  // 5. GLOBAL SETTINGS - Save configurations
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const docRef = doc(db, "settings", "site_config");
      // Strip any legacy passcode fields so the public settings doc never stores them.
      const { adminPasscode, currentPasscode, ...cleanSettings } = settingsForm;
      const updatedConfig = { ...cleanSettings };
      await setDoc(docRef, updatedConfig);
      setSiteSettings(updatedConfig);
      alert("Site ayarları başarıyla kaydedildi! Sitedeki tüm alanlar güncellendi. 🔥");
    } catch (err) {
      console.error("Ayarlar kaydedilemedi:", err);
      alert("Ayarlar kaydedilirken hata oluştu! Yetkisiz istek.");
    }
    setActionLoading(false);
  };

  // 6. SECURITY - Send a Firebase password reset email to the logged-in admin.
  // (Admin credentials now live in Firebase Authentication, not in Firestore.)
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setPasswordMessage({ text: "", type: "" });

    if (!adminEmail) {
      setPasswordMessage({ text: "Oturum e-postası bulunamadı. Lütfen yeniden giriş yapın.", type: "error" });
      return;
    }

    setActionLoading(true);
    try {
      await sendPasswordResetEmail(auth, adminEmail);
      setPasswordMessage({
        text: `Şifre sıfırlama bağlantısı ${adminEmail} adresine gönderildi. Lütfen e-posta kutunuzu kontrol edin.`,
        type: "success",
      });
    } catch (err) {
      console.error("Şifre sıfırlama e-postası gönderilemedi:", err);
      setPasswordMessage({ text: "E-posta gönderilemedi. Bağlantınızı kontrol edin.", type: "error" });
    }
    setActionLoading(false);
  };

  // RENDER HELPERS - Filter Lists
  const filteredReservations = reservations.filter(res => {
    const matchesSearch = res.customerName.toLowerCase().includes(searchRes.toLowerCase()) || 
                          res.customerPhone.includes(searchRes);
    const matchesFilter = filterResStatus === "all" || res.status === filterResStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredReviews = reviews.filter(rev => {
    const matchesSearch = rev.userName.toLowerCase().includes(searchRev.toLowerCase()) || 
                          rev.comment.toLowerCase().includes(searchRev.toLowerCase());
    const matchesStatus = filterRevStatus === "all" || 
                          (filterRevStatus === "approved" ? rev.isApproved === true : rev.isApproved !== true);
    const matchesRating = filterRevRating === "all" || rev.rating === parseInt(filterRevRating);
    return matchesSearch && matchesStatus && matchesRating;
  });

  const filteredMenu = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchMenu.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchMenu.toLowerCase());
    const matchesCategory = filterMenuCategory === "all" || item.category === filterMenuCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate Metrics
  const pendingReservations = reservations.filter(r => r.status === "beklemede").length;
  const approvedReviews = reviews.filter(r => r.isApproved).length;
  const totalReviews = reviews.length;
  const pendingReviews = totalReviews - approvedReviews;
  const unreadMessages = messages.length; // inbox count

  // Loading Screen
  if (loading) {
    return (
      <div className="admin-login-screen">
        <div className="login-box glass-card text-center">
          <div className="menu-spinner" style={{ margin: "0 auto 2rem auto" }}></div>
          <p className="gold-text">Veritabanı bağlantısı kuruluyor, lütfen bekleyin...</p>
        </div>
      </div>
    );
  }

  // Not Authenticated - Login screen
  if (!isAuthenticated) {
    return (
      <div className="admin-login-screen">
        <div className="login-box glass-card animate-zoom">
          <span className="login-logo-icon">❖</span>
          <h2 className="login-title">Ciğerci Neşet</h2>
          <p className="login-subtitle">Güvenli Yönetim Girişi</p>
          
          {passError && (
            <div className="login-error-alert animate-success">
              <span>⚠</span> {passError}
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="loginEmail">Yönetici E-posta *</label>
              <input
                type="email"
                id="loginEmail"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="ornek@cigercineset.com"
                autoComplete="username"
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="loginPassword">Şifre *</label>
              <input
                type="password"
                id="loginPassword"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Şifrenizi yazın..."
                autoComplete="current-password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-login-submit" disabled={actionLoading}>
              {actionLoading ? "Doğrulanıyor..." : "Masa Yönetimine Giriş 🔥"}
            </button>
            <p className="login-help-hint">Yetkisiz girişler kaydedilmektedir.</p>
          </form>
        </div>
      </div>
    );
  }

  // MAIN ADMIN DASHBOARD
  return (
    <div className="admin-dashboard-wrapper">
      
      {/* Header Banner */}
      <div className="admin-header glass-card animate-zoom">
        <div className="admin-header-logo">
          <span>❖</span>
          <h2>{siteSettings.restaurantName} <span className="gold-text">Yönetim Masası</span></h2>
        </div>
        <div className="admin-header-actions">
          <button className="btn btn-secondary btn-header-refresh" onClick={fetchData} disabled={loading || actionLoading}>
            🗘 Yenile
          </button>
          <button className="btn btn-accent btn-header-logout" onClick={handleLogout}>
            Güvenli Çıkış ✕
          </button>
        </div>
      </div>

      {/* İstatistik Widget'ları Grid */}
      <div className="admin-stats-grid">
        <div className="stat-widget-card glass-card animate-zoom">
          <div className="widget-header">
            <span className="widget-icon">📅</span>
            <span className="widget-label">Rezervasyonlar</span>
          </div>
          <div className="widget-value">{reservations.length}</div>
          <div className="widget-subtitle">
            <span className="glow-dot" style={{ background: pendingReservations > 0 ? "#ffcc00" : "#72cc9b" }}></span>
            {pendingReservations} Onay Bekleyen Rezervasyon
          </div>
        </div>

        <div className="stat-widget-card glass-card animate-zoom" style={{ animationDelay: "0.1s" }}>
          <div className="widget-header">
            <span className="widget-icon">💬</span>
            <span className="widget-label">Ziyaretçi Yorumları</span>
          </div>
          <div className="widget-value">{totalReviews}</div>
          <div className="widget-subtitle">
            <span className="glow-dot" style={{ background: pendingReviews > 0 ? "#ff8888" : "#72cc9b" }}></span>
            {pendingReviews} Moderasyon Bekleyen
          </div>
        </div>

        <div className="stat-widget-card glass-card animate-zoom" style={{ animationDelay: "0.2s" }}>
          <div className="widget-header">
            <span className="widget-icon">✉️</span>
            <span className="widget-label">Müşteri Mesajları</span>
          </div>
          <div className="widget-value">{unreadMessages}</div>
          <div className="widget-subtitle">
            <span className="glow-dot" style={{ background: unreadMessages > 0 ? "#ffcc00" : "#72cc9b" }}></span>
            Gelen Kutusu Aktif İletişim
          </div>
        </div>

        <div className="stat-widget-card glass-card animate-zoom" style={{ animationDelay: "0.3s" }}>
          <div className="widget-header">
            <span className="widget-icon">🍔</span>
            <span className="widget-label">Menü Çeşitleri</span>
          </div>
          <div className="widget-value">{menuItems.length}</div>
          <div className="widget-subtitle">
            <span className="glow-dot" style={{ background: "#d4af37" }}></span>
            Diyarbakır Ocakbaşı Lezzeti
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab-btn ${activeTab === "reservations" ? "active" : ""}`}
          onClick={() => setActiveTab("reservations")}
        >
          📅 Rezervasyonlar
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === "reviews" ? "active" : ""}`}
          onClick={() => setActiveTab("reviews")}
        >
          💬 Yorumlar ({pendingReviews > 0 ? `! ${pendingReviews}` : totalReviews})
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === "messages" ? "active" : ""}`}
          onClick={() => setActiveTab("messages")}
        >
          ✉ İletişim Kutusu
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === "menu" ? "active" : ""}`}
          onClick={() => setActiveTab("menu")}
        >
          🍔 Menü Yönetimi
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          ⚙️ Site Ayarları
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === "legal" ? "active" : ""}`}
          onClick={() => setActiveTab("legal")}
        >
          📜 Yasal Metinler
        </button>
      </div>

      {/* Main Panel Content */}
      <div className="admin-content-pane glass-card">
        {actionLoading && (
          <div className="action-loading-overlay">
            <div className="menu-spinner"></div>
            <p>Değişiklikler kaydediliyor...</p>
          </div>
        )}

        {/* 1. RESERVATIONS PANEL */}
        {activeTab === "reservations" && (
          <div className="reservations-table-wrapper">
            <div className="tab-pane-header-actions">
              <h3 className="tab-pane-title">Masa Rezervasyonları Takibi</h3>
              
              {/* Search & Filters */}
              <div className="filter-actions-bar">
                <input 
                  type="text" 
                  className="admin-search-input"
                  placeholder="Müşteri adı veya tel ara..."
                  value={searchRes}
                  onChange={(e) => setSearchRes(e.target.value)}
                />
                <select 
                  className="admin-filter-select"
                  value={filterResStatus}
                  onChange={(e) => setFilterResStatus(e.target.value)}
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="beklemede">⌛ Beklemede</option>
                  <option value="onaylandi">✔ Onaylandı</option>
                  <option value="iptal">❌ İptal Edildi</option>
                  <option value="tamamlandı">🏁 Tamamlandı</option>
                </select>
              </div>
            </div>

            {filteredReservations.length === 0 ? (
              <p className="no-data-hint">Aranan kriterlere uygun hiçbir rezervasyon bulunamadı.</p>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Müşteri Bilgileri</th>
                      <th>Rezervasyon Tarihi</th>
                      <th>Kişi Sayısı</th>
                      <th>Özel İstekler / Notlar</th>
                      <th>Masa Durumu</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReservations.map((res) => (
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
                                Tamamlandı
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
            <div className="tab-pane-header-actions">
              <h3 className="tab-pane-title">Ziyaretçi Yorum Moderasyonu</h3>
              
              <div className="filter-actions-bar">
                <input 
                  type="text" 
                  className="admin-search-input"
                  placeholder="Yorumcu veya kelime ara..."
                  value={searchRev}
                  onChange={(e) => setSearchRev(e.target.value)}
                />
                <select 
                  className="admin-filter-select"
                  value={filterRevStatus}
                  onChange={(e) => setFilterRevStatus(e.target.value)}
                >
                  <option value="all">Tüm Yayınlar</option>
                  <option value="approved">✔ Yayındakiler</option>
                  <option value="pending">⌛ Onay Bekleyenler</option>
                </select>
                <select 
                  className="admin-filter-select"
                  value={filterRevRating}
                  onChange={(e) => setFilterRevRating(e.target.value)}
                >
                  <option value="all">Tüm Puanlar</option>
                  <option value="5">5 Yıldız ★★★★★</option>
                  <option value="4">4 Yıldız ★★★★</option>
                  <option value="3">3 Yıldız ★★★</option>
                  <option value="2">2 Yıldız ★★</option>
                  <option value="1">1 Yıldız ★</option>
                </select>
              </div>
            </div>

            {filteredReviews.length === 0 ? (
              <p className="no-data-hint">Belirtilen kriterlerde yorum bulunamadı.</p>
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
                    {filteredReviews.map((rev) => (
                      <tr key={rev.id}>
                        <td><strong>{rev.userName}</strong></td>
                        <td><span className="admin-stars gold-text">{"★".repeat(rev.rating)}</span></td>
                        <td><p className="table-comment-text">"{rev.comment}"</p></td>
                        <td><span className="cell-date">{new Date(rev.date).toLocaleDateString("tr-TR")}</span></td>
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
                              {rev.isApproved ? "Yayından Kaldır" : "Onayla & Yayınla"}
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
            <h3 className="tab-pane-title">Müşteri İletişim Kutusu</h3>
            {messages.length === 0 ? (
              <p className="no-data-hint">Gelen kutunuzda herhangi bir mesaj bulunmuyor.</p>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Gönderen</th>
                      <th>Konu</th>
                      <th>Mesaj İçeriği</th>
                      <th>Tarih</th>
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
                        <td><strong>{msg.subject || "Genel İletişim"}</strong></td>
                        <td><p className="table-notes-text message-text-desc">{msg.message}</p></td>
                        <td><span className="cell-date">{new Date(msg.createdAt).toLocaleString("tr-TR")}</span></td>
                        <td>
                          <div className="table-actions-cell">
                            <button 
                              className="action-btn btn-table-delete"
                              onClick={() => handleDeleteItem("messages", msg.id)}
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

        {/* 4. MENU MANAGEMENT PANEL */}
        {activeTab === "menu" && (
          <div className="menu-management-wrapper">
            <div className="tab-pane-header-actions">
              <h3 className="tab-pane-title">Yemek Menüsü Yönetimi</h3>
              
              <div className="filter-actions-bar">
                <input 
                  type="text" 
                  className="admin-search-input"
                  placeholder="Yemek adı veya açıklama ara..."
                  value={searchMenu}
                  onChange={(e) => setSearchMenu(e.target.value)}
                />
                <select 
                  className="admin-filter-select"
                  value={filterMenuCategory}
                  onChange={(e) => setFilterMenuCategory(e.target.value)}
                >
                  <option value="all">Tüm Kategoriler</option>
                  {Object.entries(MENU_CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <button className="btn btn-primary" onClick={() => openMenuModal(null)}>
                  ➕ Yeni Lezzet Ekle
                </button>
              </div>
            </div>

            {filteredMenu.length === 0 ? (
              <p className="no-data-hint">Menüde aranan kriterlerde lezzet bulunamadı.</p>
            ) : (
              <div className="menu-items-admin-grid">
                {filteredMenu.map((item) => (
                  <div key={item.id} className={`admin-menu-card ${!item.isAvailable ? "menu-item-soldout" : ""}`}>

                    {/* Item Image */}
                    {item.imageUrl && (
                      <div className="admin-menu-card-img-wrapper">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          onError={(e) => {
                            e.target.src = "/resimler/sur_basalt_texture.png";
                          }}
                        />
                      </div>
                    )}

                    <div className="admin-menu-card-head">
                      <h4 className="admin-menu-card-name">{item.name}</h4>
                      <span className="gold-text admin-menu-card-price">{item.price > 0 ? `${item.price} ₺` : "İkram"}</span>
                    </div>

                    <div className="admin-menu-card-badges">
                      <span className="admin-badge admin-badge-category">
                        {MENU_CATEGORY_LABELS[item.category] || item.category}
                      </span>
                      {item.tag && (
                        <span className="admin-badge admin-badge-tag">{item.tag}</span>
                      )}
                    </div>

                    <p className="admin-menu-card-desc">{item.description}</p>

                    <div className="admin-menu-card-footer">
                      <button
                        className={`action-btn ${item.isAvailable ? "btn-table-approve" : "btn-table-reject"}`}
                        onClick={() => handleToggleMenuAvailability(item)}
                      >
                        {item.isAvailable ? "Satışta ✔" : "Tükendi ❌"}
                      </button>

                      <div className="admin-menu-card-actions">
                        <button className="action-btn btn-table-complete" onClick={() => openMenuModal(item)}>Düzenle</button>
                        <button className="action-btn btn-table-delete" onClick={() => handleDeleteItem("menu", item.id)}>Sil</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Menu Edit/Add Modal Overlay */}
            {menuModalOpen && (
              <div className="admin-modal-overlay">
                <div className="admin-modal-box glass-card animate-zoom">
                  <h3 className="gold-text" style={{ marginBottom: "1.5rem" }}>
                    {editingMenuItem ? "Lezzeti Düzenle" : "Yeni Lezzet Ekle"}
                  </h3>
                  
                  <form onSubmit={handleMenuSubmit} className="login-form">
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Yemek İsmi *</label>
                        <input 
                          type="text" 
                          required
                          value={menuForm.name}
                          onChange={(e) => setMenuForm({...menuForm, name: e.target.value})}
                          placeholder="Tarihi Diyarbakır Ciğeri"
                        />
                      </div>

                      <div className="form-group">
                        <label>Kategori *</label>
                        <select 
                          value={menuForm.category}
                          onChange={(e) => setMenuForm({...menuForm, category: e.target.value})}
                        >
                          {Object.entries(MENU_CATEGORY_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Fiyat (TL) * (0 girilirse İkram yazılır)</label>
                        <input 
                          type="number" 
                          required
                          min="0"
                          value={menuForm.price}
                          onChange={(e) => setMenuForm({...menuForm, price: e.target.value})}
                        />
                      </div>

                      <div className="form-group">
                        <label>Sıralama (Order)</label>
                        <input 
                          type="number" 
                          value={menuForm.order}
                          onChange={(e) => setMenuForm({...menuForm, order: e.target.value})}
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                        <label>Öne Çıkarılan Etiket / Tag (Örn: Şefin Seçimi, Popüler vb.)</label>
                        <input 
                          type="text" 
                          value={menuForm.tag}
                          onChange={(e) => setMenuForm({...menuForm, tag: e.target.value})}
                          placeholder="Şefin Seçimi"
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                        <label>Görsel URL Adresi (Google Drive, Google Photos veya Standart Web Linki)</label>
                        <input 
                          type="text" 
                          value={menuForm.imageUrl}
                          onChange={(e) => setMenuForm({...menuForm, imageUrl: e.target.value})}
                          placeholder="https://drive.google.com/file/d/..."
                        />
                        <p className="login-help-hint" style={{ marginTop: "0.2rem" }}>
                          * Google Drive paylaşım linki veya doğrudan görsel adresleri otomatik dönüştürülür.
                        </p>
                      </div>

                      <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                        <label>Lezzet Açıklaması *</label>
                        <textarea 
                          required
                          rows="3"
                          value={menuForm.description}
                          onChange={(e) => setMenuForm({...menuForm, description: e.target.value})}
                          placeholder="Harlanmış meşe kömürü ateşinde hazırlanan..."
                        ></textarea>
                      </div>

                      <div className="form-group" style={{ gridColumn: "1 / -1", flexDirection: "row", gap: "0.5rem", alignItems: "center" }}>
                        <input 
                          type="checkbox" 
                          id="isAvailable"
                          checked={menuForm.isAvailable}
                          onChange={(e) => setMenuForm({...menuForm, isAvailable: e.target.checked})}
                          style={{ width: "20px", height: "20px", cursor: "pointer" }}
                        />
                        <label htmlFor="isAvailable" style={{ textTransform: "none", cursor: "pointer", fontSize: "0.95rem" }}>
                          Bu yemek şu an müşterilere sunulabilir durumda (Satışta / Stokta var).
                        </label>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Kaydet 🔥</button>
                      <button type="button" className="btn btn-secondary" onClick={() => setMenuModalOpen(false)}>Kapat</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. SITE SETTINGS PANEL */}
        {activeTab === "settings" && (
          <div className="site-settings-panel">
            <h3 className="tab-pane-title">Sistem & Site Ayarları</h3>
            
            <div className="settings-split-grid">
              
              {/* Left Side - Global config form */}
              <form onSubmit={handleSettingsSubmit} className="admin-settings-form">
                <div className="settings-card">
                  <h4 className="settings-card-title">📜 Genel Restoran Bilgileri</h4>
                  <div className="settings-form-grid">
                    <div className="form-group">
                      <label>Restoran Adı</label>
                      <input 
                        type="text" 
                        value={settingsForm.restaurantName}
                        onChange={(e) => setSettingsForm({...settingsForm, restaurantName: e.target.value})}
                      />
                    </div>

                    <div className="form-group">
                      <label>Çalışma Saatleri</label>
                      <input 
                        type="text" 
                        value={settingsForm.workingHours}
                        onChange={(e) => setSettingsForm({...settingsForm, workingHours: e.target.value})}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Slogan (Footer'da Gösterilir)</label>
                      <input 
                        type="text" 
                        value={settingsForm.slogan}
                        onChange={(e) => setSettingsForm({...settingsForm, slogan: e.target.value})}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Özel Vurgu Sloganı (Çalışma Saatlerinin Altı)</label>
                      <input 
                        type="text" 
                        value={settingsForm.mottoHighlight}
                        onChange={(e) => setSettingsForm({...settingsForm, mottoHighlight: e.target.value})}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Anasayfa Canlı Arka Plan Video Linki (MP4 veya YouTube)</label>
                      <input 
                        type="text" 
                        placeholder="Örnek: MP4 Linki veya YouTube Kodu/Linki"
                        value={settingsForm.heroVideoUrl || ""}
                        onChange={(e) => setSettingsForm({...settingsForm, heroVideoUrl: e.target.value})}
                      />
                      <small className="help-hint">
                        Sitenin kotasını korumak için video harici CDN veya YouTube üzerinden oynatılır. Buraya doğrudan bir <code>.mp4</code> video linki girebilir (sıfır arayüz / tam akıcılık için önerilir) ya da 11 haneli YouTube video kodunu girip kaydedebilirsiniz.
                      </small>
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <h4 className="settings-card-title">📞 İletişim & Konum Bilgileri</h4>
                  <div className="settings-form-grid">
                    <div className="form-group">
                      <label>Telefon Numarası</label>
                      <input 
                        type="text" 
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({...settingsForm, phone: e.target.value})}
                      />
                    </div>

                    <div className="form-group">
                      <label>E-Posta Adresi</label>
                      <input 
                        type="email" 
                        value={settingsForm.email}
                        onChange={(e) => setSettingsForm({...settingsForm, email: e.target.value})}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Açık Adres Bilgisi</label>
                      <input 
                        type="text" 
                        value={settingsForm.address}
                        onChange={(e) => setSettingsForm({...settingsForm, address: e.target.value})}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Harita Embed (OSM/Google Maps Iframe Embed Src) URL</label>
                      <input 
                        type="text" 
                        value={settingsForm.mapUrl}
                        onChange={(e) => setSettingsForm({...settingsForm, mapUrl: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <h4 className="settings-card-title">📢 En Üst Kayan Duyuru Barı Ayarları</h4>
                  <div className="settings-form-grid">
                    <div className="form-group full-width form-checkbox-group">
                      <input 
                        type="checkbox" 
                        id="announcementActive"
                        checked={settingsForm.announcementActive}
                        onChange={(e) => setSettingsForm({...settingsForm, announcementActive: e.target.checked})}
                      />
                      <label htmlFor="announcementActive">
                        Anasayfada en üstte kayan duyuru barını göster.
                      </label>
                    </div>

                    <div className="form-group full-width">
                      <label>Duyuru Metni</label>
                      <input 
                        type="text" 
                        value={settingsForm.announcementText}
                        onChange={(e) => setSettingsForm({...settingsForm, announcementText: e.target.value})}
                        placeholder="Örn: Ramazan ayına özel iftar menümüz başlamıştır!"
                      />
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <h4 className="settings-card-title">🔗 Sosyal Medya Linkleri</h4>
                  <div className="settings-form-grid">
                    <div className="form-group">
                      <label>Instagram URL</label>
                      <input 
                        type="text" 
                        value={settingsForm.instagramUrl}
                        onChange={(e) => setSettingsForm({...settingsForm, instagramUrl: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Facebook URL</label>
                      <input 
                        type="text" 
                        value={settingsForm.facebookUrl}
                        onChange={(e) => setSettingsForm({...settingsForm, facebookUrl: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>YouTube URL</label>
                      <input 
                        type="text" 
                        value={settingsForm.youtubeUrl}
                        onChange={(e) => setSettingsForm({...settingsForm, youtubeUrl: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>TripAdvisor URL</label>
                      <input 
                        type="text" 
                        value={settingsForm.tripadvisorUrl}
                        onChange={(e) => setSettingsForm({...settingsForm, tripadvisorUrl: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <h4 className="settings-card-title">📅 Masa Rezervasyon Sınırlandırmaları</h4>
                  <div className="settings-form-grid">
                    <div className="form-group full-width form-checkbox-group">
                      <input 
                        type="checkbox" 
                        id="reservationsEnabled"
                        checked={settingsForm.reservationsEnabled}
                        onChange={(e) => setSettingsForm({...settingsForm, reservationsEnabled: e.target.checked})}
                      />
                      <label htmlFor="reservationsEnabled">
                        Online rezervasyon sistemini AÇIK tut (Kapatırsanız form yerine uyarı çıkar).
                      </label>
                    </div>

                    <div className="form-group full-width">
                      <label>Slot Başı Maksimum Kişi Kapasitesi</label>
                      <input 
                        type="number" 
                        value={settingsForm.maxGuestsPerSlot}
                        onChange={(e) => setSettingsForm({...settingsForm, maxGuestsPerSlot: parseInt(e.target.value)})}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Rezervasyon Sistemi Kapalıyken Çıkacak Mesaj</label>
                      <textarea 
                        rows="2"
                        value={settingsForm.reservationsDisabledMessage}
                        onChange={(e) => setSettingsForm({...settingsForm, reservationsDisabledMessage: e.target.value})}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-form-save-large">
                  Tüm Site Ayarlarını Veritabanına Kaydet 💾
                </button>
              </form>

              {/* Right Side - Account security (Firebase Auth) */}
              <div className="settings-sidebar-widgets">
                <div className="settings-card card-danger">
                  <h4 className="settings-card-title text-danger">🔒 Hesap Güvenliği</h4>

                  {adminEmail && (
                    <p className="help-text" style={{ marginBottom: "1rem" }}>
                      Giriş yapılan hesap: <strong>{adminEmail}</strong>
                    </p>
                  )}

                  {passwordMessage.text && (
                    <div className={`password-alert-box ${passwordMessage.type}`}>
                      {passwordMessage.text}
                    </div>
                  )}

                  <form onSubmit={handlePasswordReset} className="admin-settings-form">
                    <p className="help-text" style={{ marginBottom: "1rem" }}>
                      Şifrenizi değiştirmek için hesabınıza bir sıfırlama bağlantısı e-postası gönderebilirsiniz.
                    </p>
                    <button type="submit" className="btn btn-accent btn-card-save-accent" disabled={actionLoading}>
                      {actionLoading ? "Gönderiliyor..." : "Şifre Sıfırlama E-postası Gönder 🔑"}
                    </button>
                  </form>
                </div>

                {/* Security advisory */}
                <div className="settings-card">
                  <h5 className="settings-card-title text-gold">🛡️ Güvenlik Tavsiyesi</h5>
                  <p className="help-text">
                    Yönetici girişiniz Firebase Authentication ile korunmaktadır; şifreniz Google Cloud üzerinde güvenle saklanır ve sitenin kaynak kodunda yer almaz. Hesap bilgilerinizi kimseyle paylaşmayınız.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* 6. LEGAL PAGES PANEL */}
        {activeTab === "legal" && (
          <div className="legal-management-panel">
            <h3 className="tab-pane-title">Yasal Metin Yönetimi</h3>
            
            <div className="legal-split-grid">
              {/* Sidebar list of legal documents */}
              <div className="legal-sidebar">
                {[
                  { id: "privacy_policy", name: "🔒 Gizlilik Politikası" },
                  { id: "terms_of_use", name: "📝 Kullanım Koşulları" },
                  { id: "kvkk", name: "🛡️ KVKK Aydınlatma Metni" }
                ].map(docItem => (
                  <button
                    key={docItem.id}
                    className={`legal-sidebar-btn ${activeLegalDoc === docItem.id ? "active" : ""}`}
                    onClick={() => handleSelectLegalDoc(docItem.id)}
                  >
                    {docItem.name}
                  </button>
                ))}
              </div>

              {/* Editing Form */}
              <div className="settings-card legal-editor-card">
                {legalLoading ? (
                  <div className="text-center" style={{ padding: "3rem" }}>
                    <div className="menu-spinner" style={{ margin: "0 auto 1.5rem auto" }}></div>
                    <p className="gold-text">Yasal metin yükleniyor...</p>
                  </div>
                ) : (
                  <form onSubmit={handleLegalSubmit} className="admin-settings-form">
                    <h4 className="settings-card-title text-gold">
                      {legalForm.title} Sayfa İçeriğini Düzenle
                    </h4>
                    
                    <div className="form-group">
                      <label>Sayfa Başlığı *</label>
                      <input 
                        type="text" 
                        required 
                        value={legalForm.title} 
                        onChange={e => setLegalForm({ ...legalForm, title: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Sayfa Detaylı Metin İçeriği * (Paragrafları Enter tuşuna basarak ayırın)</label>
                      <textarea
                        required
                        rows="15"
                        className="legal-textarea"
                        value={legalForm.content}
                        onChange={e => setLegalForm({ ...legalForm, content: e.target.value })}
                        placeholder="Sayfada görüntülenecek yasal metin paragraflarını yazınız..."
                      ></textarea>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary btn-form-save-large" 
                      disabled={actionLoading}
                    >
                      {actionLoading ? "Kaydediliyor..." : `${legalForm.title} Metnini Kaydet ve Yayınla 💾`}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
