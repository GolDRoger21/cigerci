const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 1. Menu Data
const menuItems = [
  {
    id: "ciger-sis",
    name: "Tarihi Diyarbakır Ciğer Şiş",
    category: "cigerler",
    description: "Harlanmış meşe kömürü ateşinde zırhtan geçirilmiş kuyruk yağıyla dizilen taze kuzu ciğeri. Yanında sıcak lavaş, közlenmiş isot, ezme salata ve sumaklı piyaz soğan eşliğinde bakır tepside sunulur.",
    price: 320,
    tag: "Şefin Seçimi",
    isAvailable: true,
    order: 1
  },
  {
    id: "yaprak-ciger",
    name: "Özel Tereyağlı Yaprak Ciğer",
    category: "cigerler",
    description: "İnce dilimlenmiş kuzu ciğerinin bakır tavada, taze yayık tereyağı, sarımsak ve özel Diyarbakır baharatlarıyla sotelenmiş eşsiz lezzeti.",
    price: 310,
    tag: "Yöresel Lezzet",
    isAvailable: true,
    order: 2
  },
  {
    id: "diyarbakir-kebap",
    name: "Zırh Kebabı (Diyarbakır Usulü)",
    category: "kebaplar",
    description: "Kuzu eti ve kuyruk yağının zırhla çekilip pul biber ile yoğrulmasıyla hazırlanan acılı köz kebabı. Közlenmiş domates ve biber ile servis edilir.",
    price: 340,
    tag: "Popüler",
    isAvailable: true,
    order: 3
  },
  {
    id: "kuzu-sis",
    name: "Lokum Kuzu Şiş",
    category: "kebaplar",
    description: "Zeytinyağı, süt ve Diyarbakır baharatları ile 24 saat marine edilmiş lokum gibi yumuşak kuzu but etleri, köz patlıcan yatağında.",
    price: 380,
    tag: "",
    isAvailable: true,
    order: 4
  },
  {
    id: "tavuk-sis",
    name: "Baharatlı Tavuk Şiş",
    category: "kebaplar",
    description: "Özel yoğurt soslu marinesiyle yumuşacık közlenmiş tavuk göğsü şişleri, lavaş ve acılı ezme eşliğinde.",
    price: 260,
    tag: "",
    isAvailable: true,
    order: 5
  },
  {
    id: "bostana-salata",
    name: "Nar Ekşili Bostana Salatası",
    category: "mezeler",
    description: "Çok ince kıyılmış domates, salatalık, taze nane, maydanoz, yeşil biber, sızma zeytinyağı ve hakiki Diyarbakır nar ekşisi sosu.",
    price: 90,
    tag: "Mekan İkramı",
    isAvailable: true,
    order: 6
  },
  {
    id: "ezme-salata",
    name: "Acılı Fındık Ezme",
    category: "mezeler",
    description: "Közlenmiş isot, domates, sarımsak ve taze baharatların zırh ile püre haline getirilip zeytinyağı ile buluşması.",
    price: 0,
    tag: "Ücretsiz İkram",
    isAvailable: true,
    order: 7
  },
  {
    id: "sumakli-sogan",
    name: "Sumaklı Piyaz Soğan",
    category: "mezeler",
    description: "Ciğerin vazgeçilmezi; ince kıyım soğan, maydanoz ve bol Diyarbakır sumağı ile harmanlanmış meze.",
    price: 0,
    tag: "Ücretsiz İkram",
    isAvailable: true,
    order: 8
  },
  {
    id: "burma-kadayif",
    name: "Cevizli Diyarbakır Burma Kadayıfı",
    category: "tatlilar",
    description: "Diyarbakır'ın tescilli çıtır burma kadayıfı. Bol tereyağı ile kızartılıp sıcak şerbet ve üzerine serpilen Antep fıstığı ile servis edilir.",
    price: 140,
    tag: "Tescilli Lezzet",
    isAvailable: true,
    order: 9
  },
  {
    id: "kunefe",
    name: "Köz Ateşinde Künefe",
    category: "tatlilar",
    description: "Özel künefe peyniri ve tel kadayıfın bakır tepside, meşe kömürü közünde ağır ağır pişirilmesiyle yapılan sıcak tatlı ziyafeti.",
    price: 160,
    tag: "Sıcak Servis",
    isAvailable: true,
    order: 10
  },
  {
    id: "yayik-ayrani",
    name: "Köpüklü Yayık Ayranı",
    category: "icecekler",
    description: "Tamamen doğal yoğurttan yayıkta hazırlanan, buz gibi ve bol köpüklü, bakır maşrapada sunulan serinletici ayran.",
    price: 45,
    tag: "Ev Yapımı",
    isAvailable: true,
    order: 11
  },
  {
    id: "mirra",
    name: "Geleneksel Mırra Kahvesi",
    category: "icecekler",
    description: "Kulpsuz fincanda ikram edilen, saatlerce kaynatılarak hazırlanan yoğun aromalı, sindirim kolaylaştırıcı meşhur Diyarbakır mırrası.",
    price: 50,
    tag: "Geleneksel",
    isAvailable: true,
    order: 12
  }
];

// 2. Reviews Data
const reviews = [
  {
    id: "review-1",
    userName: "Mustafa Demir",
    rating: 5,
    comment: "Diyarbakır surlarının hemen yanında, otantik bir ortamda ciğer yemenin tadı bambaşka. Neşet Usta'nın ciğeri lokum gibi, baharat dengesi muazzam. Kesinlikle 5 yıldız!",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    isApproved: true
  },
  {
    id: "review-2",
    userName: "Zeynep Aslan",
    rating: 5,
    comment: "Hayatımda yediğim en lezzetli ciğer şişti. Masaya gelen ezmeler, sumaklı soğan ve sıcacık lavaşlar harikaydı. Küp köpüklü yayık ayranını da mutlaka denemelisiniz.",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    isApproved: true
  },
  {
    id: "review-3",
    userName: "Caner Yılmaz",
    rating: 5,
    comment: "Mekanın tarihi dokusu beni büyüledi. Bakır sunumlar, çalışanların ilgisi ve ocakbaşından gelen o koku... Diyarbakır'a gelip Ciğerci Neşet'e uğramamak büyük kayıp olur.",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isApproved: true
  }
];

// 3. Reservations Data
const reservations = [
  {
    id: "res-1",
    customerName: "Ahmet Kurt",
    customerPhone: "05321112233",
    customerEmail: "ahmet@mail.com",
    guestCount: 4,
    date: "2026-06-05",
    time: "19:30",
    notes: "Ocakbaşına yakın bir masa rica ediyoruz, şehir dışından misafirlerimiz olacak.",
    status: "onaylandi",
    createdAt: new Date().toISOString()
  },
  {
    id: "res-2",
    customerName: "Elif Şahin",
    customerPhone: "05445556677",
    customerEmail: "elif@mail.com",
    guestCount: 2,
    date: "2026-06-06",
    time: "20:00",
    notes: "Yıldönümü yemeği olacak, sakin bir masa tercih ederiz.",
    status: "beklemede",
    createdAt: new Date().toISOString()
  }
];

// 4. Messages Data
const messages = [
  {
    id: "msg-1",
    name: "Kadir Yurt",
    email: "kadir@mail.com",
    subject: "Grup Rezervasyonu",
    message: "Cumartesi günü 25 kişilik bir grup yemeği organize etmek istiyoruz. Alkolsüz toplu menü fiyatlarınızı öğrenebilir miyim?",
    createdAt: new Date().toISOString()
  }
];

async function seedDatabase() {
  console.log("🔥 Firestore seeding süreci başladı...");

  try {
    // Write Menu
    console.log("📦 Menü elemanları yükleniyor...");
    for (const item of menuItems) {
      await db.collection("menu").doc(item.id).set(item);
    }
    console.log("✅ Menü başarıyla yüklendi.");

    // Write Reviews
    console.log("💬 Müşteri yorumları yükleniyor...");
    for (const review of reviews) {
      await db.collection("reviews").doc(review.id).set(review);
    }
    console.log("✅ Yorumlar başarıyla yüklendi.");

    // Write Reservations
    console.log("📅 Örnek rezervasyonlar yükleniyor...");
    for (const res of reservations) {
      await db.collection("reservations").doc(res.id).set(res);
    }
    console.log("✅ Rezervasyonlar başarıyla yüklendi.");

    // Write Messages
    console.log("✉️ Örnek mesajlar yükleniyor...");
    for (const msg of messages) {
      await db.collection("messages").doc(msg.id).set(msg);
    }
    console.log("✅ İletişim mesajları başarıyla yüklendi.");

    console.log("🎉 Firestore veritabanı başarıyla kuruldu ve verilerle beslendi!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Veritabanı seeding hatası:", error);
    process.exit(1);
  }
}

seedDatabase();
