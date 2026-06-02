const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const legalTexts = {
  privacy_policy: {
    id: "privacy_policy",
    title: "Gizlilik Politikası",
    updatedAt: new Date().toISOString(),
    content: `Ciğerci Neşet olarak, web sitemizi ziyaret eden misafirlerimizin kişisel verilerinin korunmasına ve gizliliğine son derece önem veriyoruz. Bu Gizlilik Politikası, sitemiz üzerinden toplanan bilgilerin nasıl kullanıldığını ve korunduğunu açıklamaktadır.

1. Toplanan Veriler:
Web sitemiz üzerinden masa rezervasyonu yaptığınızda veya iletişim formunu doldurduğunuzda; adınız soyadınız, telefon numaranız, e-posta adresiniz ve rezervasyon notlarınız gibi bilgiler toplanmaktadır.

2. Verilerin Kullanım Amacı:
Toplanan kişisel verileriniz, sadece masa rezervasyonunuzun doğrulanması, taleplerinizin yanıtlanması ve sizlere daha iyi bir ocakbaşı hizmeti sunulabilmesi amacıyla kullanılmaktadır. Bilgileriniz kesinlikle üçüncü şahıslarla paylaşılmaz veya ticari amaçla satılmaz.

3. Güvenlik:
Verileriniz güvenli Google Cloud ve Firebase sunucularında depolanmakta olup, yetkisiz erişimleri engellemek için gerekli tüm teknik ve idari güvenlik önlemleri alınmıştır.`
  },
  terms_of_use: {
    id: "terms_of_use",
    title: "Kullanım Koşulları",
    updatedAt: new Date().toISOString(),
    content: `Ciğerci Neşet web sitesine hoş geldiniz. Sitemizi kullanarak aşağıda belirtilen kullanım koşullarını kabul etmiş sayılmaktasınız.

1. Hizmet Kapsamı:
Bu web sitesi, Ciğerci Neşet restoranının menüsünü incelemek, online masa rezervasyon talebi oluşturmak ve restoranımızla iletişim kurmak amacıyla hazırlanmıştır.

2. Rezervasyon Kuralları:
Sitemiz üzerinden yapılan rezervasyonlar bir ön talep niteliğindedir. Rezervasyonunuz, ekibimiz tarafından telefonla aranarak onaylanmadığı sürece kesinleşmiş sayılmaz. Yoğun günlerde rezervasyon saatinden 15 dakika sonra gelmeyen misafirlerimizin masaları iptal edilebilir.

3. Fikri Mülkiyet:
Sitede yer alan tüm logolar, grafikler, iştah açıcı görseller ve metinler Ciğerci Neşet'in fikri mülkiyetindedir. İzinsiz kopyalanması veya ticari amaçla kullanılması yasaktır.`
  },
  kvkk: {
    id: "kvkk",
    title: "KVKK Aydınlatma Metni",
    updatedAt: new Date().toISOString(),
    content: `Kişisel Verilerin Korunması Kanunu (KVKK) Aydınlatma Metni

Ciğerci Neşet olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, veri sorumlusu sıfatıyla siz değerli misafirlerimizin kişisel verilerini yasal sınırlar dahilinde işlemekteyiz.

1. Kişisel Verilerin İşlenme Amacı:
Masa rezervasyonu taleplerinin alınması, müşteri memnuniyeti değerlendirmelerinin takibi, şikayet ve önerilerinizin yanıtlanması amacıyla kişisel verileriniz işlenmektedir.

2. İşlenen Verileriniz ve Aktarımı:
Ad, soyad, telefon ve e-posta verileriniz kanuni yükümlülükler haricinde üçüncü parti kurum veya şahıslara aktarılmamakta, sadece restoran bünyesindeki yönetim sisteminde saklanmaktadır.

3. Haklarınız:
Kanun kapsamında kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, eksik veya yanlış işlenmişse düzeltilmesini isteme haklarına sahipsiniz. Taleplerinizi info@cigercineset.com adresine iletebilirsiniz.`
  }
};

async function seedLegal() {
  console.log("🔥 Firestore Yasal Sayfalar seeding süreci başladı...");

  try {
    for (const key of Object.keys(legalTexts)) {
      await db.collection("legal").doc(key).set(legalTexts[key]);
      console.log(`✅ ${legalTexts[key].title} başarıyla legal/${key} dökümanına yüklendi.`);
    }
    console.log("🎉 Yasal sayfalar seeding işlemi başarıyla tamamlandı!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding hatası:", error);
    process.exit(1);
  }
}

seedLegal();
