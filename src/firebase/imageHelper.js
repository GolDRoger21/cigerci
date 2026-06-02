/**
 * Google Drive ve diğer bulut servislerinin paylaşılan görsel linklerini
 * web sitelerinde doğrudan render edilebilecek (hotlink) formatlara dönüştüren yardımcı fonksiyonlar.
 */

export function getDirectImageUrl(url) {
  if (!url || typeof url !== "string") return "";

  const trimmedUrl = url.trim();

  // 1. Google Drive Paylaşım Linki Regex Eşleşmeleri
  // Örnek: https://drive.google.com/file/d/1234567890abcdefg/view?usp=sharing
  // Örnek: https://drive.google.com/open?id=1234567890abcdefg
  // Örnek: https://docs.google.com/file/d/1234567890abcdefg/edit
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/(?:file\/d\/|open\?id=))([a-zA-Z0-9_-]+)/;
  const driveMatch = trimmedUrl.match(driveRegex);

  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    // Google Drive direct hotlink formatı (en hızlı ve güvenli CDN)
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // 2. Google Photos Paylaşım Linki Uyarı & Destek
  // Google Photos'ta "Bağlantıyı Al" ile oluşturulan linkler HTML sayfasıdır.
  // Kullanıcıya bu konuda rehberlik edilir ama eğer doğrudan lh3 linki girildiyse olduğu gibi bırakılır.
  if (trimmedUrl.includes("photos.app.goo.gl") || (trimmedUrl.includes("photos.google.com") && !trimmedUrl.includes("lh3.googleusercontent.com"))) {
    console.warn("Lütfen Google Photos paylaşım linki yerine görselin üzerindeki 'Resim Adresini Kopyala' seçeneğini kullanın.");
  }

  return trimmedUrl;
}
