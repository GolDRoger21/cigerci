import React from "react";
import AdminDashboard from "../../components/AdminDashboard";

export const metadata = {
  title: "Ciğerci Neşet - Yönetici Paneli",
  description: "Masa rezervasyonları, müşteri değerlendirmeleri ve iletişim mesajları yönetim paneli.",
  robots: "noindex, nofollow" // Keep search engines from indexing the admin panel!
};

export default function AdminPage() {
  return (
    <main style={{ backgroundColor: "#090807", minHeight: "100vh" }}>
      <AdminDashboard />
    </main>
  );
}
