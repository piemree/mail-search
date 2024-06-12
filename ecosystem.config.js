module.exports = {
    apps: [
      {
        name: "app",          // Uygulama adı
        script: "yarn",                // Çalıştırılacak komut
        args: "start",                // Komuta eklenecek argümanlar
        instances: 1,                 // Çalışacak instance sayısı
        autorestart: true,            // Otomatik yeniden başlatma
        watch: false,                 // Dosyaları izleme (development için true olabilir)
        max_memory_restart: "2G",     // Bellek sınırı
        env: {
          NODE_ENV: "production"      // Ortam değişkeni
        }
      }
    ]
  };
  