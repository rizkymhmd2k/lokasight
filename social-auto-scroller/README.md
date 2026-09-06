# Social Auto Scroller

Extension Chrome Manifest V3 untuk scroll otomatis di LinkedIn, X, Threads, Instagram, Facebook, TikTok, Reddit, dan halaman infinite-scroll lain.

## Instalasi

1. Buka `chrome://extensions`.
2. Aktifkan **Developer mode**.
3. Klik **Load unpacked**.
4. Pilih folder `social-auto-scroller` ini.
5. Pin **Social Auto Scroller** ke toolbar.

Jika extension sudah pernah dimuat lalu filenya diperbarui, klik tombol **Reload** pada kartu extension dan refresh tab media sosial.

## Pemakaian

1. Buka profil atau feed yang ingin ditelusuri.
2. Klik icon extension.
3. Atur jarak, jeda, batas macet, dan batas waktu.
4. Klik **Mulai**.

Extension otomatis mencari area scroll terbaik. Jika salah area, klik **Pilih area scroll**, arahkan mouse ke feed sampai garis kuning muncul, lalu klik. Buka popup lagi dan tekan **Mulai**.

Saat berjalan, indikator tampil di kanan bawah halaman. Angka **langkah** hanya bertambah ketika posisi scroll benar-benar berpindah.

## Catatan

- Setting tersimpan hanya di browser lokal.
- Extension hanya mendapat akses ke tab setelah icon diklik (`activeTab`).
- Refresh atau pindah ke halaman baru menghentikan proses; mulai ulang dari popup.
- Platform dapat membatasi histori, menghentikan infinite scroll, meminta CAPTCHA, atau menerapkan rate limit. Extension tidak melewati pembatasan tersebut.
