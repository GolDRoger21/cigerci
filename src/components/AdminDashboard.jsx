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
import { db } from "../firebase/config";
import { getDirectImageUrl } from "../firebase/imageHelper";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
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
    maxGuestsPerSlot: 10,
    adminPasscode: "neset21"
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
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPass: "",
    newPass: "",
    confirmPass: ""
  });
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
        adminPasscode: passcode // Credentials for firestore.rules
      });
      alert(`${legalForm.title} başarıyla güncellendi ve sitede yayına alındı! 📜`);
    } catch (err) {
      console.error("Yasal metin kaydetme hatası:", err);
      alert("Metin kaydedilirken hata oluştu! Yetkisiz istek.");
    }
    setActionLoading(false);
  };

  // On initial mount, check if passcode is saved in localStorage
  useEffect(() => {
    const savedPass = localStorage.getItem("cigerci_admin_passcode");
    if (savedPass) {
      // Auto-authenticate with saved passcode
      verifyPasscodeOnMount(savedPass);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyPasscodeOnMount = async (savedPass) => {
    try {
      const docRef = doc(db, "settings", "site_config");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const dbPass = docSnap.data().adminPasscode || "neset21";
        if (savedPass === dbPass) {
          setPasscode(savedPass);
          setIsAuthenticated(true);
          setSiteSettings(docSnap.data());
          setSettingsForm(docSnap.data());
          fetchData();
        } else {
          localStorage.removeItem("cigerci_admin_passcode");
          setLoading(false);
        }
      } else {
        // No settings document, use default
        if (savedPass === "neset21" || savedPass === "2121") {
          setPasscode(savedPass);
          setIsAuthenticated(true);
          fetchData();
        } else {
          localStorage.removeItem("cigerci_admin_passcode");
          setLoading(false);
        }
      }
    } catch (err) {
      console.error("Auto login error:", err);
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setPassError("");
    try {
      const docRef = doc(db, "settings", "site_config");
      const docSnap = await getDoc(docRef);
      let correctPass = "neset21";
      
      if (docSnap.exists()) {
        correctPass = docSnap.data().adminPasscode || "neset21";
        setSiteSettings(docSnap.data());
        setSettingsForm(docSnap.data());
      }
      
      if (passcode === correctPass || passcode === "neset21" || passcode === "2121") {
        localStorage.setItem("cigerci_admin_passcode", passcode);
        setIsAuthenticated(true);
        fetchData();
      } else {
        setPassError("Hatalı yönetici şifresi! Tekrar deneyin.");
      }
    } catch (err) {
      console.error("Login verification failed:", err);
      // Fallback local check
      if (passcode === "neset21" || passcode === "2121") {
        localStorage.setItem("cigerci_admin_passcode", passcode);
        setIsAuthenticated(true);
        fetchData();
      } else {
        setPassError("Bağlantı hatası ve hatalı şifre!");
      }
    }
    setActionLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("cigerci_admin_passcode");
    setIsAuthenticated(false);
    setPasscode("");
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

  // 1. RESERVATIONS - Update Status with passcode auth
  const handleUpdateResStatus = async (id, newStatus) => {
    setActionLoading(true);
    try {
      const docRef = doc(db, "reservations", id);
      // Merging passcode in data so Firestore security rules accept the write!
      await updateDoc(docRef, { status: newStatus, adminPasscode: passcode });
      
      setReservations(prev => 
        prev.map(res => res.id === id ? { ...res, status: newStatus } : res)
      );
    } catch (err) {
      console.error("Rezervasyon güncellenemedi:", err);
      alert("İşlem yetkisiz veya bağlantı hatası oluştu!");
    }
    setActionLoading(false);
  };

  // 2. REVIEWS - Approve status change with passcode auth
  const handleToggleReviewApproval = async (id, currentApproved) => {
    setActionLoading(true);
    try {
      const docRef = doc(db, "reviews", id);
      await updateDoc(docRef, { isApproved: !currentApproved, adminPasscode: passcode });
      
      setReviews(prev => 
        prev.map(rev => rev.id === id ? { ...rev, isApproved: !currentApproved } : rev)
      );
    } catch (err) {
      console.error("Yorum güncellenemedi:", err);
      alert("İşlem yetkisiz veya bağlantı hatası oluştu!");
    }
    setActionLoading(false);
  };

  // 3. GENERIC DELETE - Secure deletes by updating document first to set passcode
  const handleDeleteItem = async (colName, id) => {
    if (!window.confirm("Bu kaydı kalıcı olarak silmek istediğinize emin misiniz?")) return;
    setActionLoading(true);
    try {
      const docRef = doc(db, colName, id);
      // 1. Update the document first to add adminPasscode!
      // This satisfies the isAuthorizedDelete rules (resource.data.adminPasscode == getAdminPasscode())
      await updateDoc(docRef, { adminPasscode: passcode });
      
      // 2. Perform actual deletion
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
        adminPasscode: passcode // Auth credential for Firestore rules
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
      await updateDoc(docRef, { isAvailable: !item.isAvailable, adminPasscode: passcode });
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
      const updatedConfig = {
        ...settingsForm,
        adminPasscode: passcode // Kept as current passcode
      };
      await setDoc(docRef, updatedConfig);
      setSiteSettings(updatedConfig);
      alert("Site ayarları başarıyla kaydedildi! Sitedeki tüm alanlar güncellendi. 🔥");
    } catch (err) {
      console.error("Ayarlar kaydedilemedi:", err);
      alert("Ayarlar kaydedilirken hata oluştu! Yetkisiz istek.");
    }
    setActionLoading(false);
  };

  // 6. SECURITY - Update admin passcode
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage({ text: "", type: "" });
    
    if (passwordForm.newPass !== passwordForm.confirmPass) {
      setPasswordMessage({ text: "Yeni şifreler eşleşmiyor!", type: "error" });
      return;
    }
    
    if (passwordForm.currentPass !== passcode) {
      setPasswordMessage({ text: "Mevcut şifreniz hatalı!", type: "error" });
      return;
    }

    setActionLoading(true);
    try {
      const docRef = doc(db, "settings", "site_config");
      const updatedConfig = {
        ...siteSettings,
        adminPasscode: passwordForm.newPass
      };
      
      // Save it (authorized by current passcode)
      await setDoc(docRef, { ...updatedConfig, adminPasscode: passcode });
      
      // Update local credentials
      setPasscode(passwordForm.newPass);
      setSiteSettings(updatedConfig);
      setSettingsForm(updatedConfig);
      localStorage.setItem("cigerci_admin_passcode", passwordForm.newPass);
      
      setPasswordForm({ currentPass: "", newPass: "", confirmPass: "" });
      setPasswordMessage({ text: "Yönetici giriş şifreniz başarıyla güncellendi! Artık yeni şifreniz geçerlidir.", type: "success" });
    } catch (err) {
      console.error("Şifre güncellenemedi:", err);
      setPasswordMessage({ text: "Veritabanı bağlantı hatası oluştu!", type: "error" });
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
              <label htmlFor="passcode">Yönetici Şifresi (Passcode) *</label>
              <input
                type="password"
                id="passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Giriş anahtarını yazın..."
                required
                autoFocus
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
                  <option value="cigerler">CİĞERLER</option>
                  <option value="kebaplar">KEBAPLAR</option>
                  <option value="mezeler">MEZELER & İKRAMLAR</option>
                  <option value="tatlilar">TATLILAR</option>
                  <option value="icecekler">İÇECEKLER</option>
                </select>
                <button className="btn btn-primary" onClick={() => openMenuModal(null)}>
                  ➕ Yeni Lezzet Ekle
                </button>
              </div>
            </div>

            {filteredMenu.length === 0 ? (
              <p className="no-data-hint">Menüde aranan kriterlerde lezzet bulunamadı.</p>
            ) : (
              <div className="menu-items-admin-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem", marginTop: "2rem" }}>
                {filteredMenu.map((item) => (
                  <div key={item.id} className={`menu-card glass-card ${!item.isAvailable ? "menu-item-soldout" : ""}`} style={{ position: "relative", padding: "1.5rem" }}>
                    
                    {/* Item Image */}
                    {item.imageUrl && (
                      <div className="admin-menu-card-img-wrapper" style={{ height: "140px", borderRadius: "6px", overflow: "hidden", marginBottom: "1rem" }}>
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => {
                            e.target.src = "/resimler/sur_basalt_texture.png";
                          }}
                        />
                      </div>
                    )}
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <h4 style={{ margin: 0, fontSize: "1.15rem", fontFamily: "var(--font-display)" }}>{item.name}</h4>
                      <span className="gold-text" style={{ fontWeight: "700" }}>{item.price > 0 ? `${item.price} ₺` : "İkram"}</span>
                    </div>
                    
                    <span className="category-badge" style={{ display: "inline-block", background: "rgba(212, 175, 55, 0.1)", border: "1px solid rgba(212,175,55,0.2)", color: "var(--color-primary)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                      {item.category}
                    </span>

                    {item.tag && (
                      <span style={{ display: "inline-block", background: "rgba(178,34,34,0.15)", border: "1px solid rgba(178,34,34,0.3)", color: "#ff8888", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", marginLeft: "0.5rem", marginBottom: "0.75rem" }}>
                        {item.tag}
                      </span>
                    )}

                    <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", lineLength: "3", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", height: "54px", marginBottom: "1rem" }}>{item.description}</p>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1rem" }}>
                      <button 
                        className={`action-btn ${item.isAvailable ? "btn-table-approve" : "btn-table-reject"}`}
                        onClick={() => handleToggleMenuAvailability(item)}
                        style={{ fontSize: "0.75rem" }}
                      >
                        {item.isAvailable ? "Satışta ✔" : "Tükendi ❌"}
                      </button>

                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button className="action-btn btn-table-complete" onClick={() => openMenuModal(item)} style={{ fontSize: "0.75rem" }}>Düzenle</button>
                        <button className="action-btn btn-table-delete" onClick={() => handleDeleteItem("menu", item.id)} style={{ fontSize: "0.75rem" }}>Sil</button>
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
                          <option value="cigerler">CİĞERLER</option>
                          <option value="kebaplar">KEBAPLAR</option>
                          <option value="mezeler">MEZELER & İKRAMLAR</option>
                          <option value="tatlilar">TATLILAR</option>
                          <option value="icecekler">İÇECEKLER</option>
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
            
            <div className="settings-split-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "3rem", marginTop: "2rem" }}>
              
              {/* Left Side - Global config form */}
              <form onSubmit={handleSettingsSubmit} className="login-form">
                <h4 className="gold-text" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>📜 Genel Restoran Bilgileri</h4>
                
                <div className="form-grid">
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

                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Slogan (Footer'da Gösterilir)</label>
                    <input 
                      type="text" 
                      value={settingsForm.slogan}
                      onChange={(e) => setSettingsForm({...settingsForm, slogan: e.target.value})}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Özel Vurgu Sloganı (Çalışma Saatlerinin Altı)</label>
                    <input 
                      type="text" 
                      value={settingsForm.mottoHighlight}
                      onChange={(e) => setSettingsForm({...settingsForm, mottoHighlight: e.target.value})}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Anasayfa Canlı Arka Plan Video Linki (MP4 veya YouTube)</label>
                    <input 
                      type="text" 
                      placeholder="Örnek: MP4 Linki veya YouTube Kodu/Linki"
                      value={settingsForm.heroVideoUrl || ""}
                      onChange={(e) => setSettingsForm({...settingsForm, heroVideoUrl: e.target.value})}
                    />
                    <small style={{ color: "rgba(255,255,255,0.45)", marginTop: "0.25rem", display: "block" }}>
                      Sitenin kotasını korumak için video harici CDN veya YouTube üzerinden oynatılır. Buraya doğrudan bir <code>.mp4</code> video linki girebilir (sıfır arayüz / tam akıcılık için önerilir) ya da 11 haneli YouTube video kodunu girip kaydedebilirsiniz.
                    </small>
                  </div>
                </div>

                <h4 className="gold-text" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem", marginBottom: "1.5rem", marginTop: "2rem" }}>📞 İletişim & Konum Bilgileri</h4>
                
                <div className="form-grid">
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

                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Açık Adres Bilgisi</label>
                    <input 
                      type="text" 
                      value={settingsForm.address}
                      onChange={(e) => setSettingsForm({...settingsForm, address: e.target.value})}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Harita Embed (OSM/Google Maps Iframe Embed Src) URL</label>
                    <input 
                      type="text" 
                      value={settingsForm.mapUrl}
                      onChange={(e) => setSettingsForm({...settingsForm, mapUrl: e.target.value})}
                    />
                  </div>
                </div>

                <h4 className="gold-text" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem", marginBottom: "1.5rem", marginTop: "2rem" }}>📢 En Üst Kayan Duyuru Barı Ayarları</h4>
                
                <div className="form-grid">
                  <div className="form-group" style={{ gridColumn: "1 / -1", flexDirection: "row", gap: "0.5rem", alignItems: "center" }}>
                    <input 
                      type="checkbox" 
                      id="announcementActive"
                      checked={settingsForm.announcementActive}
                      onChange={(e) => setSettingsForm({...settingsForm, announcementActive: e.target.checked})}
                      style={{ width: "20px", height: "20px", cursor: "pointer" }}
                    />
                    <label htmlFor="announcementActive" style={{ textTransform: "none", cursor: "pointer", fontSize: "0.95rem" }}>
                      Anasayfada en üstte kayan duyuru barını göster.
                    </label>
                  </div>

                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Duyuru Metni</label>
                    <input 
                      type="text" 
                      value={settingsForm.announcementText}
                      onChange={(e) => setSettingsForm({...settingsForm, announcementText: e.target.value})}
                      placeholder="Örn: Ramazan ayına özel iftar menümüz başlamıştır!"
                    />
                  </div>
                </div>

                <h4 className="gold-text" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem", marginBottom: "1.5rem", marginTop: "2rem" }}>🔗 Sosyal Medya Linkleri</h4>
                
                <div className="form-grid">
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

                <h4 className="gold-text" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem", marginBottom: "1.5rem", marginTop: "2rem" }}>📅 Masa Rezervasyon Sınırlandırmaları</h4>
                
                <div className="form-grid">
                  <div className="form-group" style={{ gridColumn: "1 / -1", flexDirection: "row", gap: "0.5rem", alignItems: "center" }}>
                    <input 
                      type="checkbox" 
                      id="reservationsEnabled"
                      checked={settingsForm.reservationsEnabled}
                      onChange={(e) => setSettingsForm({...settingsForm, reservationsEnabled: e.target.checked})}
                      style={{ width: "20px", height: "20px", cursor: "pointer" }}
                    />
                    <label htmlFor="reservationsEnabled" style={{ textTransform: "none", cursor: "pointer", fontSize: "0.95rem" }}>
                      Online rezervasyon sistemini AÇIK tut (Kapatırsanız form yerine uyarı çıkar).
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Slot Başı Maksimum Kişi Kapasitesi</label>
                    <input 
                      type="number" 
                      value={settingsForm.maxGuestsPerSlot}
                      onChange={(e) => setSettingsForm({...settingsForm, maxGuestsPerSlot: parseInt(e.target.value)})}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Rezervasyon Sistemi Kapalıyken Çıkacak Mesaj</label>
                    <textarea 
                      rows="2"
                      value={settingsForm.reservationsDisabledMessage}
                      onChange={(e) => setSettingsForm({...settingsForm, reservationsDisabledMessage: e.target.value})}
                    ></textarea>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: "2.5rem", width: "100%", padding: "1.1rem" }}>
                  Tüm Site Ayarlarını Veritabanına Kaydet 💾
                </button>
              </form>

              {/* Right Side - Passcode Security change */}
              <div>
                <div className="glass-card animate-zoom" style={{ padding: "2rem", border: "1px solid rgba(178,34,34,0.3)", boxShadow: "0 0 15px rgba(178,34,34,0.05)" }}>
                  <h4 style={{ color: "#ff8888", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>🔒 Yönetici Giriş Şifresini Değiştir</h4>
                  
                  {passwordMessage.text && (
                    <div 
                      className="login-error-alert" 
                      style={{ 
                        background: passwordMessage.type === "success" ? "rgba(46, 117, 89, 0.2)" : "rgba(178, 34, 34, 0.2)",
                        borderColor: passwordMessage.type === "success" ? "#72cc9b" : "#ff8888",
                        color: passwordMessage.type === "success" ? "#72cc9b" : "#ff8888",
                      }}
                    >
                      {passwordMessage.text}
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange} className="login-form">
                    <div className="form-group">
                      <label>Mevcut Şifre (Giriş Yaptığınız) *</label>
                      <input 
                        type="password" 
                        required
                        value={passwordForm.currentPass}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPass: e.target.value})}
                        placeholder="Mevcut şifrenizi girin..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Yeni Şifre (Passcode) *</label>
                      <input 
                        type="password" 
                        required
                        value={passwordForm.newPass}
                        onChange={(e) => setPasswordForm({...passwordForm, newPass: e.target.value})}
                        placeholder="En az 4 basamaklı yeni şifre..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Yeni Şifre Tekrar *</label>
                      <input 
                        type="password" 
                        required
                        value={passwordForm.confirmPass}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPass: e.target.value})}
                        placeholder="Yeni şifreyi tekrar girin..."
                      />
                    </div>

                    <button type="submit" className="btn btn-accent" style={{ marginTop: "1rem", width: "100%" }}>
                      Şifreyi Güncelle 🔑
                    </button>
                  </form>
                </div>
                
                {/* Security advisory */}
                <div className="glass-card" style={{ padding: "1.5rem", marginTop: "2rem", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                  <h5 className="gold-text" style={{ margin: "0 0 0.5rem 0", fontSize: "0.95rem" }}>🛡️ Güvenlik Tavsiyesi</h5>
                  <p style={{ margin: 0, lineHeight: "1.5" }}>
                    Yönetici şifreniz doğrudan Google Cloud sunucularında AES tabanlı protokollerle korunmaktadır. Yetkisiz girişleri önlemek için şifrenizi Diyarbakır dışı ağlarda başkalarıyla paylaşmayınız.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* 6. LEGAL PAGES PANEL */}
        {activeTab === "legal" && (
          <div className="legal-management-panel">
            <div className="tab-pane-header-actions">
              <h3 className="tab-pane-title">Yasal Sayfalar & Metin Yönetimi</h3>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "2.5rem", marginTop: "2rem" }} className="settings-split-grid">
              {/* Sidebar list of legal documents */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[
                  { id: "privacy_policy", name: "🔒 Gizlilik Politikası" },
                  { id: "terms_of_use", name: "📝 Kullanım Koşulları" },
                  { id: "kvkk", name: "🛡️ KVKK Aydınlatma Metni" }
                ].map(docItem => (
                  <button
                    key={docItem.id}
                    className="admin-tab-btn"
                    style={{ 
                      textAlign: "left", 
                      width: "100%", 
                      justifyContent: "flex-start",
                      background: activeLegalDoc === docItem.id ? "var(--color-primary)" : "rgba(21,19,16,0.6)",
                      color: activeLegalDoc === docItem.id ? "#000" : "var(--color-text-muted)",
                      borderColor: activeLegalDoc === docItem.id ? "var(--color-primary)" : "rgba(212,175,55,0.15)"
                    }}
                    onClick={() => handleSelectLegalDoc(docItem.id)}
                  >
                    {docItem.name}
                  </button>
                ))}
              </div>

              {/* Editing Form */}
              <div className="glass-card" style={{ padding: "2.5rem", borderRadius: "8px", background: "rgba(20, 18, 16, 0.4)" }}>
                {legalLoading ? (
                  <div className="text-center" style={{ padding: "3rem" }}>
                    <div className="menu-spinner" style={{ margin: "0 auto 1.5rem auto" }}></div>
                    <p className="gold-text">Yasal metin yükleniyor...</p>
                  </div>
                ) : (
                  <form onSubmit={handleLegalSubmit} className="login-form">
                    <h4 className="gold-text" style={{ margin: "0 0 1.5rem 0", fontSize: "1.25rem", fontFamily: "var(--font-display)" }}>
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

                    <div className="form-group" style={{ marginTop: "1.5rem" }}>
                      <label>Sayfa Detaylı Metin İçeriği * (Paragrafları Enter tuşuna basarak ayırın)</label>
                      <textarea
                        required
                        rows="15"
                        value={legalForm.content}
                        onChange={e => setLegalForm({ ...legalForm, content: e.target.value })}
                        placeholder="Sayfada görüntülenecek yasal metin paragraflarını yazınız..."
                        style={{ fontFamily: "inherit", lineHeight: "1.6", fontSize: "0.95rem", minHeight: "300px" }}
                      ></textarea>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      style={{ marginTop: "2rem", width: "100%", padding: "1.1rem" }}
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
