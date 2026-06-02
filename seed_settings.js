const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const initialSettings = {
  adminPasscode: "neset21",
  restaurantName: "Ciğerci Neşet",
  slogan: "Diyarbakır'ın Kadim Tarihinden, Ocakbaşı Sıcaklığıyla Sofranıza...",
  announcementActive: true,
  announcementText: "🔥 Tarihi Suriçi'nde asırlık lezzet; Neşet Usta'nın özel terbiyeli ciğeri şimdi gece 02:00'ye kadar hizmetinizde!",
  phone: "+90 (412) 222 21 21",
  email: "info@cigercineset.com",
  address: "Tarihi Suriçi, Gazi Caddesi No: 47, Sur / Diyarbakır",
  workingHours: "Haftanın Her Günü: 08:00 - Gece 02:00",
  mottoHighlight: "Gece Ciğeri Servisimiz Mevcuttur.",
  mapUrl: "https://www.openstreetmap.org/export/embed.html?bbox=40.228%2C37.906%2C40.245%2C37.918&layer=mapnik&marker=37.912%2C40.237",
  instagramUrl: "https://instagram.com/cigercineset",
  facebookUrl: "https://facebook.com/cigercineset",
  youtubeUrl: "https://youtube.com/cigercineset",
  tripadvisorUrl: "https://tripadvisor.com/cigercineset",
  reservationsEnabled: true,
  reservationsDisabledMessage: "Şu anda yoğunluk sebebiyle online rezervasyon sistemimiz kapalıdır. Rezervasyon talepleriniz için lütfen telefon numaralarımızdan iletişime geçiniz.",
  maxGuestsPerSlot: 15
};

async function seedSettings() {
  console.log("🔥 Firestore Site Ayarları seeding süreci başladı...");

  try {
    // Write Settings Document
    await db.collection("settings").doc("site_config").set(initialSettings);
    console.log("✅ Site ayarları başarıyla settings/site_config dökümanına yüklendi.");
    
    // Let's also check if menu items need direct image URLs update
    // Update menu items with placeholder images or existing beautiful images from public folder
    const menuColl = db.collection("menu");
    const menuSnapshot = await menuColl.get();
    
    console.log("📦 Mevcut menü görsel yolları güncelleniyor...");
    for (const doc of menuSnapshot.docs) {
      const data = doc.data();
      let imageUrl = "";
      
      // Assign specific high-quality generated local images
      if (doc.id === "ciger-sis") {
        imageUrl = "/resimler/ciger_plating.png";
      } else if (doc.id === "yaprak-ciger") {
        imageUrl = "/resimler/yaprak_ciger.png";
      } else if (doc.id === "diyarbakir-kebap") {
        imageUrl = "/resimler/Gemini_Generated_Image_pmvftppmvftppmvf.png";
      } else if (doc.id === "kuzu-sis") {
        imageUrl = "/resimler/hero_ocakbasi.png";
      } else if (doc.id === "tavuk-sis") {
        imageUrl = "/resimler/Gemini_Generated_Image_9s8ok99s8ok99s8o.png";
      } else if (doc.id === "bostana-salata") {
        imageUrl = "/resimler/bostana_salata.png";
      } else if (doc.id === "ezme-salata") {
        imageUrl = "/resimler/acili_ezme.png";
      } else if (doc.id === "sumakli-sogan") {
        imageUrl = "/resimler/sumakli_sogan.png";
      } else if (doc.id === "burma-kadayif") {
        imageUrl = "/resimler/burma_kadayif.png";
      } else if (doc.id === "kunefe") {
        imageUrl = "/resimler/kunefe.png";
      } else if (doc.id === "yayik-ayrani") {
        imageUrl = "/resimler/yayik_ayrani.png";
      } else if (doc.id === "mirra") {

        imageUrl = "/resimler/mirra_kahvesi.png";
      } else {
        imageUrl = "/resimler/sur_basalt_texture.png";
      }

      
      await menuColl.doc(doc.id).update({
        imageUrl: imageUrl,
        // also add default adminPasscode field if we want to satisfy any security write rule tests later
      });
    }
    
    console.log("✅ Menü görselleri başarıyla güncellendi.");
    console.log("🎉 Seeding başarıyla tamamlandı!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding hatası:", error);
    process.exit(1);
  }
}

seedSettings();
