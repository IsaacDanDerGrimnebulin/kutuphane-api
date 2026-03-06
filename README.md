# 📚 Kütüphane API (Book Review API)

Bu proje, kitap incelemeleri ve yönetimi için geliştirilmiş, **PERN (PostgreSQL, Express, React, Node.js)** yığını kullanılarak inşa edilmiş bir RESTful API çalışmasıdır. Geliştirilmeye devam ediyor.

## 🚀 Projenin Amacı

Bu çalışma, modern web teknolojileriyle güvenli, ölçeklenebilir ve kullanıcı odaklı bir API geliştirme süreçlerini (CRUD işlemleri, kimlik doğrulama, veritabanı yönetimi) pekiştirmek amacıyla geliştirilmiştir.

## 🛠 Kullanılan Teknolojiler (Tech Stack)

- **Backend:** Node.js, Express.js
- **Veritabanı:** PostgreSQL (`pg` ile)
- **Kimlik Doğrulama:** JSON Web Tokens (JWT), Bcrypt (şifreleme)
- **Güvenlik:** CORS yapılandırması, Dotenv (çevre değişkenleri)

## 📦 Kurulum ve Çalıştırma

Projeyi kendi bilgisayarınızda çalıştırmak için şu adımları izleyin:

1. **Depoyu klonlayın:**

```bash
git clone https://github.com/IsaacDanDerGrimnebulin/kutuphane-api.git
cd kutuphane-api
```

2. **Bağımlılıkları yükleyin:**

```bash
npm install

```

3. **Çevre değişkenlerini yapılandırın:**
   Projeyi yerelinizde çalıştırabilmek için kök dizinde `.env` adında bir dosya oluşturmanız gerekmektedir. Lütfen aşağıdaki şablonu kopyalayıp, kendi sisteminize uygun değerlerle güncelleyin:

```env
# .env dosyası örneği
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_PASSWORD=sifreniz
DB_DATABASE=veritabani_adi
DB_PORT=5432
JWT_SECRET=cok_gizli_anahtar
JWT_EXPIRES_IN=1h
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

```

4. **Sunucuyu başlatın:**

- "Eğer projeyi geliştiriyorsanız:

```bash
npm run dev

```

- Sadece çalıştırmak istiyorsanız:

```bash
npm start

```

## 📝 Özellikler

- **Kullanıcı Yönetimi:** Kayıt olma ve giriş yapma (JWT destekli).
- **Kitap Yönetimi:** Kitap listeleme, detay görüntüleme, inceleme ekleme.
- **Güvenlik:** Bcrypt ile parola güvenliği ve yetkilendirme (authorization).

## 🗄️ Veritabanı (Database)

Proje şu an **aktif geliştirme aşamasındadır**. Veritabanı şeması henüz stabil olmadığı için repository içerisinde yer almamaktadır. Geliştirme süreci tamamlandığında ve yapı nihai halini aldığında, SQL şema dosyası (`database.sql`) projeye eklenecektir.

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) ile korunmaktadır. Detaylar için [LICENSE](LICENSE) dosyasına bakabilirsiniz.
