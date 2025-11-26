# Stellar Stream - Proje İskeleti

## 📁 Proje Yapısı

Proje, Admin ve Ambassador olmak üzere iki farklı rol için ayrı arayüzler içermektedir.

### Frontend Klasör Yapısı

```
frontend/
├── app/
│   ├── (admin)/              # Admin route grubu
│   │   ├── layout.tsx        # Admin layout
│   │   └── admin/
│   │       ├── dashboard/    # Admin ana sayfa
│   │       ├── ambassadors/  # Ambassador yönetimi
│   │       ├── campaigns/    # Kampanya yönetimi
│   │       ├── payments/     # Ödeme yönetimi
│   │       ├── analytics/    # Analitik sayfası
│   │       ├── reports/      # Raporlar
│   │       └── settings/     # Ayarlar
│   │
│   ├── (ambassador)/         # Ambassador route grubu
│   │   ├── layout.tsx        # Ambassador layout
│   │   └── ambassador/
│   │       ├── dashboard/    # Ambassador ana sayfa
│   │       ├── campaigns/    # Kampanyalarım
│   │       ├── performance/  # Performans
│   │       ├── referrals/    # Referanslar
│   │       ├── earnings/     # Kazançlar
│   │       ├── wallet/       # Cüzdan
│   │       └── settings/     # Ayarlar
│   │
│   ├── landing/              # Landing page
│   ├── select-role/          # Rol seçim sayfası
│   ├── stream-demo.tsx       # Stream demo (eski ana sayfa)
│   └── page.tsx              # Ana sayfa (landing'e yönlendirir)
│
├── components/
│   ├── layouts/
│   │   └── Sidebar.tsx       # Dinamik sidebar component
│   ├── CreateStreamModal.tsx
│   ├── MyStreamsDashboard.tsx
│   ├── StreamCard.tsx
│   ├── StreamCounter.tsx
│   ├── WalletConnect.tsx
│   └── WithdrawModal.tsx
│
├── lib/
│   ├── contract.ts           # Smart contract fonksiyonları
│   ├── stellar.ts            # Stellar blockchain işlemleri
│   └── utils.ts              # Yardımcı fonksiyonlar
│
└── types/
    ├── index.ts              # Genel type tanımları
    └── role.ts               # Rol ile ilgili type'lar
```

## 🎯 Roller ve Sayfalar

### Admin Rolü

Admin kullanıcıları aşağıdaki sayfalara erişebilir:

- **Dashboard**: Genel özet ve istatistikler
- **Ambassadors**: Ambassador listesi ve yönetimi
- **Campaigns**: Kampanya oluşturma ve yönetimi
- **Payments**: Ödeme takibi ve yönetimi
- **Analytics**: Detaylı analitikler ve metrikler
- **Reports**: Rapor oluşturma ve görüntüleme
- **Settings**: Platform ayarları

### Ambassador Rolü

Ambassador kullanıcıları aşağıdaki sayfalara erişebilir:

- **Dashboard**: Kişisel özet ve istatistikler
- **My Campaigns**: Katıldığım kampanyalar
- **Performance**: Performans metrikleri
- **Referrals**: Referans yönetimi ve takibi
- **Earnings**: Kazanç geçmişi ve detayları
- **Wallet**: Kripto cüzdan yönetimi
- **Settings**: Kişisel ayarlar

## 🚀 Kullanım

### Sayfa Akışı

1. **Ana Sayfa (/)**: Otomatik olarak `/landing` sayfasına yönlendirir
2. **Landing Page (/landing)**: Wallet bağlantısı ve platform tanıtımı
3. **Rol Seçimi (/select-role)**: Kullanıcı rolünü seçme (Admin veya Ambassador)
4. **Dashboard**: Seçilen role göre ilgili dashboard'a yönlendirme

### Sidebar Özellikleri

- **Daraltılabilir**: Yan menü daraltılıp genişletilebilir
- **Rol Bazlı Menü**: Her rol için farklı menü öğeleri
- **Aktif Sayfa İşaretleme**: Bulunulan sayfa vurgulanır
- **Kullanıcı Bilgisi**: Wallet adresi ve rol bilgisi gösterilir

## 🎨 Tasarım Özellikleri

- **Gradient Temalar**: Purple-Pink gradient renk paleti
- **Glassmorphism**: Cam efekti kartlar ve komponenler
- **Responsive Design**: Mobil uyumlu tasarım
- **Animasyonlar**: Framer Motion ile smooth animasyonlar
- **Modern UI**: Tailwind CSS ile modern arayüz

## 📝 Sıradaki Adımlar

1. ✅ Proje iskeletini oluşturma (Tamamlandı)
2. 🔄 Backend API entegrasyonu
3. 🔄 Smart contract entegrasyonu
4. 🔄 Rol bazlı yetkilendirme sistemi
5. 🔄 Gerçek veri ile sayfaların doldurulması
6. 🔄 Form ve modal componentleri
7. 🔄 Stream özelliğinin ana projeye entegrasyonu

## 🔧 Geliştirme Notları

- Şu anda tüm sayfalar iskelet halindedir
- Rol kontrolü localStorage üzerinden yapılmaktadır (geçici)
- Backend entegrasyonu sonrası gerçek rol yönetimi eklenecek
- Stream demo sayfası `/stream-demo` adresinde korunmuştur
