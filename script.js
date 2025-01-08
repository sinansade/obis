class OgrenciTakipSistemi {
    constructor() {
        this.ogrenciler = JSON.parse(localStorage.getItem('ogrenciler')) || [];
        this.ogretmenler = JSON.parse(localStorage.getItem('ogretmenler')) || [
            { id: 1, ad: 'Sinan SADE', brans: 'Matematik' },
            { id: 2, ad: 'Havva Nur Aydın', brans: 'İngilizce' },
            { id: 3, ad: 'Burçak Özkaraman', brans: 'Türkçe' },
            { id: 4, ad: 'Seda Çomak', brans: 'Fen Bilgisi' }
        ];
        this.init();
    }

    init() {
        this.formInit();
        
        // Arama event listener'ları
        ['aramaIsim', 'aramaSinif', 'aramaOgretmen'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.kartlariGoster());
            }
        });
        
        this.kartlariGoster();
    }

    formInit() {
        // Öğrenci ekleme formu
        document.getElementById('ogrenciForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.ogrenciEkle();
        });

        // Ders kaydı formu
        document.getElementById('dersKaydiForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.dersKaydiEkle();
        });

        // Veli görüşmesi formu
        document.getElementById('veliGorusmesiForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.veliGorusmesiEkle();
        });

        // Öğretmen formu
        document.getElementById('ogretmenForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.ogretmenKaydet();
        });
    }

    ogrenciEkle() {
        const ogretmenSelect = document.getElementById('ogretmen');
        const ogrenciAdi = document.getElementById('ogrenciAdi').value.trim();

        if (!ogretmenSelect.value) {
            alert('Lütfen bir öğretmen seçiniz');
            return;
        }

        // Aynı isimde öğrenci var mı kontrol et
        const mevcutOgrenci = this.ogrenciler.find(o => 
            o.ad.toLowerCase() === ogrenciAdi.toLowerCase()
        );

        if (mevcutOgrenci) {
            // Direkt olarak ders ekleme modalını aç
            document.getElementById('ogrenciForm').reset();
            this.dersKaydiModalAc(mevcutOgrenci.id);
            return;
        }

        const ogretmenBilgisi = ogretmenSelect.value.split('|');
        const ogrenci = {
            id: Date.now(),
            ad: ogrenciAdi,
            sinif: document.getElementById('sinif').value,
            ogretmen: {
                ad: ogretmenBilgisi[0],
                ders: ogretmenBilgisi[1]
            },
            dersKayitlari: [],
            veliGorusmeleri: []
        };

        this.ogrenciler.push(ogrenci);
        this.kaydet();
        this.kartlariGoster();
        document.getElementById('ogrenciForm').reset();
    }

    mevcutOgrenciUyariGoster(ogrenci) {
        // Mevcut öğrenci detaylarını göster
        document.getElementById('mevcutOgrenciDetay').innerHTML = `
            <strong>Öğrenci Adı:</strong> ${ogrenci.ad}<br>
            <strong>Sınıf:</strong> ${ogrenci.sinif}<br>
            <strong>Öğretmen:</strong> ${ogrenci.ogretmen.ad} (${ogrenci.ogretmen.ders})<br>
            <strong>Toplam Ders:</strong> ${ogrenci.dersKayitlari.length}
        `;

        // Geçici olarak öğrenci ID'sini sakla
        this.geciciOgrenciId = ogrenci.id;

        // Modalı göster
        new bootstrap.Modal(document.getElementById('mevcutOgrenciModal')).show();
    }

    dersKaydiModalAcMevcut() {
        // Mevcut öğrenci uyarı modalını kapat
        bootstrap.Modal.getInstance(document.getElementById('mevcutOgrenciModal')).hide();
        
        // Kısa bir gecikme ile ders kayıt modalını aç
        setTimeout(() => {
            this.dersKaydiModalAc(this.geciciOgrenciId);
            this.geciciOgrenciId = null; // Geçici ID'yi temizle
        }, 300);
    }

    dersKaydiEkle() {
        const ogrenciId = parseInt(document.getElementById('dersOgrenciId').value);
        const ogretmenSelect = document.getElementById('dersKaydiOgretmen');
        const ogretmenBilgisi = ogretmenSelect.value.split('|');
        const ogretmenAdi = ogretmenBilgisi[0];
        const ogretmenDers = ogretmenBilgisi[1];

        const dersKaydi = {
            tarih: document.getElementById('dersTarih').value,
            saat: document.getElementById('dersSaat').value,
            konu: document.getElementById('dersKonu').value,
            ogretmen: {
                ad: ogretmenAdi,
                ders: ogretmenDers
            },
            eklenmeTarihi: new Date().toLocaleString()
        };

        const ogrenci = this.ogrenciler.find(o => o.id === ogrenciId);
        ogrenci.dersKayitlari.push(dersKaydi);
        
        this.kaydet();
        this.kartlariGoster();
        
        // Formu temizle ve modalı kapat
        document.getElementById('dersKaydiForm').reset();
        bootstrap.Modal.getInstance(document.getElementById('dersKaydiModal')).hide();
    }

    veliGorusmesiEkle() {
        const ogrenciId = parseInt(document.getElementById('veliOgrenciId').value);
        const gorusmesiId = document.getElementById('veliGorusmesiId').value;
        const veliGorusmesi = {
            id: gorusmesiId || Date.now(), // Eğer düzenleme ise var olan ID'yi kullan
            tarih: document.getElementById('veliTarih').value,
            saat: document.getElementById('veliSaat').value,
            not: document.getElementById('veliNot').value,
            ogretmen: document.getElementById('gorusmeYapanOgretmen').value,
            sonGuncelleme: new Date().toLocaleString(),
        };

        const ogrenci = this.ogrenciler.find(o => o.id === ogrenciId);
        
        if (gorusmesiId) {
            // Düzenleme işlemi
            const index = ogrenci.veliGorusmeleri.findIndex(g => g.id == gorusmesiId);
            if (index !== -1) {
                ogrenci.veliGorusmeleri[index] = veliGorusmesi;
            }
        } else {
            // Yeni görüşme ekleme
            ogrenci.veliGorusmeleri.push(veliGorusmesi);
        }
        
        this.kaydet();
        this.kartlariGoster();
        bootstrap.Modal.getInstance(document.getElementById('veliGorusmesiModal')).hide();
    }

    veliGorusmesiDuzenle(ogrenciId, gorusmeId) {
        // Önce detay modalını kapat
        bootstrap.Modal.getInstance(document.getElementById('ogrenciDetayModal')).hide();
        
        const ogrenci = this.ogrenciler.find(o => o.id === ogrenciId);
        const gorusme = ogrenci.veliGorusmeleri.find(g => g.id == gorusmeId);
        
        // Kısa bir gecikme ile düzenleme modalını aç
        setTimeout(() => {
            document.getElementById('veliOgrenciId').value = ogrenciId;
            document.getElementById('veliGorusmesiId').value = gorusmeId;
            document.getElementById('gorusmeYapanOgretmen').value = gorusme.ogretmen || '';
            document.getElementById('veliTarih').value = gorusme.tarih;
            document.getElementById('veliSaat').value = gorusme.saat;
            document.getElementById('veliNot').value = gorusme.not;
            
            new bootstrap.Modal(document.getElementById('veliGorusmesiModal')).show();
        }, 300); // 300ms gecikme
    }

    kartlariGoster() {
        const container = document.getElementById('ogrenciKartlari');
        container.innerHTML = '';

        // Filtreleme değerlerini al
        const isimFiltre = document.getElementById('aramaIsim').value.toLowerCase();
        const sinifFiltre = document.getElementById('aramaSinif').value.toLowerCase();
        const ogretmenFiltre = document.getElementById('aramaOgretmen').value;

        // Filtreleme uygula
        const filtrelenmisOgrenciler = this.ogrenciler.filter(ogrenci => {
            const isimUygun = ogrenci.ad.toLowerCase().includes(isimFiltre);
            const sinifUygun = ogrenci.sinif.toString().toLowerCase().includes(sinifFiltre);
            const ogretmenUygun = !ogretmenFiltre || ogrenci.ogretmen.ad === ogretmenFiltre;
            
            return isimUygun && sinifUygun && ogretmenUygun;
        });

        // Filtrelenmiş öğrencileri göster
        filtrelenmisOgrenciler.forEach(ogrenci => {
            const kart = this.kartOlustur(ogrenci);
            container.appendChild(kart);
        });

        // İstatistikleri güncelle
        this.istatistikleriGuncelle();
    }

    kartOlustur(ogrenci) {
        const div = document.createElement('div');
        div.className = 'col-md-4 mb-4';
        div.innerHTML = `
            <div class="card ogrenci-kart">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h5 class="card-title mb-0">${ogrenci.ad}</h5>
                            <small class="text-muted">Öğretmen: ${ogrenci.ogretmen?.ad || 'Belirtilmemiş'} (${ogrenci.ogretmen?.ders || 'Belirtilmemiş'})</small>
                        </div>
                        <button class="btn btn-sm btn-outline-danger" 
                                onclick="event.stopPropagation(); sistem.silmeOnayiGoster(${ogrenci.id})">
                            <i class="fas fa-trash"></i> Sil
                        </button>
                    </div>
                </div>
                <div class="card-body" onclick="sistem.ogrenciDetayGoster(${ogrenci.id})">
                    <p class="ozet-bilgi">
                        Sınıf: ${ogrenci.sinif}<br>
                        Toplam Ders: ${ogrenci.dersKayitlari.length}<br>
                        Veli Görüşmesi: ${ogrenci.veliGorusmeleri.length}
                    </p>
                    <div class="btn-group btn-group-sm w-100" onclick="event.stopPropagation()">
                        <button class="btn btn-primary" onclick="sistem.dersKaydiModalAc(${ogrenci.id})">
                            Ders Ekle
                        </button>
                        <button class="btn btn-success" onclick="sistem.veliGorusmesiModalAc(${ogrenci.id})">
                            Veli Görüşmesi
                        </button>
                    </div>
                    <hr>
                    <div class="kayitlar mt-3">
                        <h6>Son Dersler:</h6>
                        ${this.sonDerslerHTML(ogrenci.dersKayitlari)}
                        <h6 class="mt-3">Son Veli Görüşmeleri:</h6>
                        ${this.sonVeliGorusmeleriHTML(ogrenci.veliGorusmeleri)}
                    </div>
                    <div class="hizli-not-alani mt-3" onclick="event.stopPropagation()">
                        <div class="input-group">
                            <input type="text" class="form-control form-control-sm" 
                                   id="hizliNot_${ogrenci.id}" 
                                   placeholder="Hızlı not ekle...">
                            <button class="btn btn-sm btn-outline-primary" 
                                    onclick="sistem.hizliNotEkle(${ogrenci.id})">
                                Ekle
                            </button>
                        </div>
                        <div class="notlar-listesi mt-2">
                            ${this.notlariGoster(ogrenci.notlar || [])}
                        </div>
                    </div>
                </div>
            </div>
        `;
        return div;
    }

    sonDerslerHTML(dersler) {
        return dersler.slice(-3).reverse().map(ders => {
            const ogretmenAdi = ders.ogretmen?.ad || 'Belirtilmemiş';
            const ogretmenDers = ders.ogretmen?.ders || '';
            
            return `
                <div class="ders-kaydi">
                    <strong>${ders.tarih}</strong> ${ders.saat}<br>
                    <span class="text-muted">
                        ${ders.konu}<br>
                        Öğretmen: ${ogretmenAdi}${ogretmenDers ? ` - ${ogretmenDers}` : ''}
                    </span>
                </div>
            `;
        }).join('');
    }

    sonVeliGorusmeleriHTML(gorusmeler) {
        return gorusmeler.slice(-3).reverse().map(gorusme => `
            <div class="veli-gorusmesi">
                ${gorusme.tarih} ${gorusme.saat} - ${gorusme.not.substring(0, 50)}...
            </div>
        `).join('');
    }

    dersKaydiModalAc(ogrenciId) {
        document.getElementById('dersOgrenciId').value = ogrenciId;
        new bootstrap.Modal(document.getElementById('dersKaydiModal')).show();
    }

    veliGorusmesiModalAc(ogrenciId) {
        // Form'u sıfırla
        document.getElementById('veliGorusmesiForm').reset();
        document.getElementById('veliOgrenciId').value = ogrenciId;
        document.getElementById('veliGorusmesiId').value = ''; // Yeni kayıt için ID'yi temizle
        new bootstrap.Modal(document.getElementById('veliGorusmesiModal')).show();
    }

    kaydet() {
        localStorage.setItem('ogrenciler', JSON.stringify(this.ogrenciler));
    }

    ogrenciDetayGoster(ogrenciId) {
        const ogrenci = this.ogrenciler.find(o => o.id === ogrenciId);
        if (!ogrenci) return;

        // Öğrenci bilgileri
        document.getElementById('ogrenciDetayBilgi').innerHTML = `
            <div class="detay-bilgi-item">
                <strong>Ad Soyad:</strong> ${ogrenci.ad}
            </div>
            <div class="detay-bilgi-item">
                <strong>Sınıf:</strong> ${ogrenci.sinif}
            </div>
            <div class="detay-bilgi-item">
                <strong>Öğretmen:</strong> ${ogrenci.ogretmen.ad}
            </div>
            <div class="detay-bilgi-item">
                <strong>Ders:</strong> ${ogrenci.ogretmen.ders}
            </div>
            <div class="detay-bilgi-item">
                <strong>Toplam Ders Sayısı:</strong> ${ogrenci.dersKayitlari.length}
            </div>
            <div class="detay-bilgi-item">
                <strong>Toplam Veli Görüşmesi:</strong> ${ogrenci.veliGorusmeleri.length}
            </div>
            <div class="detay-bilgi-item">
                <strong>Notlar:</strong>
                ${ogrenci.notlar && ogrenci.notlar.length ? 
                    ogrenci.notlar.map(not => `
                        <div class="not-item mt-2">
                            <i class="fas fa-sticky-note"></i> ${not.metin}
                            <small>(${not.tarih})</small>
                        </div>
                    `).join('') : 
                    '<div class="text-muted mt-2">Henüz not eklenmemiş</div>'
                }
            </div>
        `;

        // Ders kayıtları
        document.getElementById('ogrenciDersKayitlari').innerHTML = 
            ogrenci.dersKayitlari.length ? 
            ogrenci.dersKayitlari.map(ders => `
                <div class="kayit-item">
                    <strong>${ders.tarih}</strong> ${ders.saat}<br>
                    <span class="text-muted">Konu: ${ders.konu}</span><br>
                    <small class="text-muted">
                        Öğretmen: ${ders.ogretmen.ad} - ${ders.ogretmen.ders}<br>
                        ${ders.eklenmeTarihi ? `Eklenme Tarihi: ${ders.eklenmeTarihi}` : ''}
                    </small>
                </div>
            `).join('') : 
            '<div class="text-muted">Henüz ders kaydı bulunmuyor.</div>';

        // Veli görüşmeleri
        document.getElementById('ogrenciVeliGorusmeleri').innerHTML = 
            ogrenci.veliGorusmeleri.length ? 
            ogrenci.veliGorusmeleri.map(gorusme => `
                <div class="kayit-item">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <strong>${gorusme.tarih}</strong> ${gorusme.saat}<br>
                            <span class="text-muted">${gorusme.not}</span><br>
                            <small class="text-muted">
                                Görüşmeyi Yapan: ${gorusme.ogretmen || 'Belirtilmemiş'}<br>
                                Son Güncelleme: ${gorusme.sonGuncelleme || 'Belirtilmemiş'}
                            </small>
                        </div>
                        <button class="btn btn-sm btn-outline-primary" 
                                onclick="event.stopPropagation(); sistem.veliGorusmesiDuzenle(${ogrenci.id}, ${gorusme.id})">
                            Düzenle
                        </button>
                    </div>
                </div>
            `).join('') : 
            '<div class="text-muted">Henüz veli görüşmesi bulunmuyor.</div>';

        // Modalı göster
        new bootstrap.Modal(document.getElementById('ogrenciDetayModal')).show();
    }

    silmeOnayiGoster(ogrenciId) {
        const ogrenci = this.ogrenciler.find(o => o.id === ogrenciId);
        if (!ogrenci) return;

        // Silinecek öğrenci detaylarını göster
        document.getElementById('silinecekOgrenciDetay').innerHTML = `
            <strong>Öğrenci Adı:</strong> ${ogrenci.ad}<br>
            <strong>Sınıf:</strong> ${ogrenci.sinif}<br>
            <strong>Öğretmen:</strong> ${ogrenci.ogretmen.ad} (${ogrenci.ogretmen.ders})<br>
            <strong>Toplam Ders:</strong> ${ogrenci.dersKayitlari.length}<br>
            <strong>Toplam Veli Görüşmesi:</strong> ${ogrenci.veliGorusmeleri.length}
        `;

        // Geçici olarak silinecek öğrenci ID'sini sakla
        this.silinecekOgrenciId = ogrenciId;

        // Silme onay modalını göster
        new bootstrap.Modal(document.getElementById('silmeOnayModal')).show();
    }

    ogrenciSil() {
        if (!this.silinecekOgrenciId) return;

        // Öğrenciyi diziden kaldır
        this.ogrenciler = this.ogrenciler.filter(o => o.id !== this.silinecekOgrenciId);
        
        // LocalStorage'ı güncelle
        this.kaydet();
        
        // Kartları yeniden göster
        this.kartlariGoster();
        
        // Silme modalını kapat
        bootstrap.Modal.getInstance(document.getElementById('silmeOnayModal')).hide();
        
        // Geçici ID'yi temizle
        this.silinecekOgrenciId = null;
    }

    istatistikleriGuncelle() {
        // Ana kart istatistikleri
        const toplamOgrenci = this.ogrenciler.length;
        const toplamDers = this.ogrenciler.reduce((toplam, ogrenci) => 
            toplam + ogrenci.dersKayitlari.length, 0);
        const toplamGorusme = this.ogrenciler.reduce((toplam, ogrenci) => 
            toplam + ogrenci.veliGorusmeleri.length, 0);

        document.getElementById('toplamOgrenci').textContent = toplamOgrenci;
        document.getElementById('toplamDers').textContent = toplamDers;
        document.getElementById('toplamGorusme').textContent = toplamGorusme;
    }

    istatistikDetayGoster() {
        // Varsayılan olarak son 30 günü seç
        const bitis = new Date();
        const baslangic = new Date();
        baslangic.setDate(baslangic.getDate() - 30);

        const bitisElement = document.getElementById('istatistikBitis');
        const baslangicElement = document.getElementById('istatistikBaslangic');

        if (bitisElement && baslangicElement) {
            bitisElement.value = bitis.toISOString().split('T')[0];
            baslangicElement.value = baslangic.toISOString().split('T')[0];
        }

        // Modalı göster
        const modal = new bootstrap.Modal(document.getElementById('istatistikDetayModal'));
        modal.show();
        
        // İlk filtrelemeyi yap
        setTimeout(() => this.istatistikleriFiltrele(), 500);
    }

    istatistikleriFiltrele() {
        const ogretmen = document.getElementById('istatistikOgretmen').value;
        const baslangic = document.getElementById('istatistikBaslangic').value;
        const bitis = document.getElementById('istatistikBitis').value;

        // Tarihleri kontrol et
        if (!baslangic || !bitis) {
            alert('Lütfen tarih aralığı seçin');
            return;
        }

        const baslangicTarih = new Date(baslangic);
        const bitisTarih = new Date(bitis);
        bitisTarih.setHours(23, 59, 59); // Bitiş gününün sonuna kadar

        // Ders istatistikleri
        let dersSayisi = 0;
        let farkliOgrenciler = new Set();
        let dersKonulari = new Set();
        const gunlukDersler = {};

        // Veli görüşmesi istatistikleri
        let gorusmeSayisi = 0;
        let gorusmeYapilanVeliler = new Set();

        this.ogrenciler.forEach(ogrenci => {
            // Ders kayıtlarını filtrele
            ogrenci.dersKayitlari.forEach(ders => {
                const dersTarih = new Date(ders.tarih);
                if (dersTarih >= baslangicTarih && dersTarih <= bitisTarih) {
                    if (!ogretmen || ders.ogretmen.ad === ogretmen) {
                        dersSayisi++;
                        farkliOgrenciler.add(ogrenci.id);
                        dersKonulari.add(ders.konu);

                        // Günlük rapor için
                        const gunKey = ders.tarih;
                        if (!gunlukDersler[gunKey]) {
                            gunlukDersler[gunKey] = [];
                        }
                        gunlukDersler[gunKey].push({
                            tip: 'ders',
                            ogrenci: ogrenci.ad,
                            ogretmen: ders.ogretmen.ad,
                            konu: ders.konu,
                            saat: ders.saat
                        });
                    }
                }
            });

            // Veli görüşmelerini filtrele
            ogrenci.veliGorusmeleri.forEach(gorusme => {
                const gorusmeTarih = new Date(gorusme.tarih);
                if (gorusmeTarih >= baslangicTarih && gorusmeTarih <= bitisTarih) {
                    if (!ogretmen || gorusme.ogretmen === ogretmen) {
                        gorusmeSayisi++;
                        gorusmeYapilanVeliler.add(ogrenci.id);

                        // Günlük rapor için
                        const gunKey = gorusme.tarih;
                        if (!gunlukDersler[gunKey]) {
                            gunlukDersler[gunKey] = [];
                        }
                        gunlukDersler[gunKey].push({
                            tip: 'gorusme',
                            ogrenci: ogrenci.ad,
                            ogretmen: gorusme.ogretmen,
                            not: gorusme.not,
                            saat: gorusme.saat
                        });
                    }
                }
            });
        });

        // Ders istatistiklerini göster
        const dersIstatElement = document.getElementById('dersIstatistikleri');
        if (dersIstatElement) {
            dersIstatElement.innerHTML = `
                <div class="alert alert-info">
                    <h4 class="alert-heading">Ders Özeti</h4>
                    <p class="mb-0">
                        Toplam Ders: ${dersSayisi}<br>
                        Farklı Öğrenci: ${farkliOgrenciler.size}<br>
                        Farklı Konu: ${dersKonulari.size}
                    </p>
                </div>
            `;
        }

        // Veli görüşmesi istatistiklerini göster
        const gorusmeIstatElement = document.getElementById('gorusmeIstatistikleri');
        if (gorusmeIstatElement) {
            gorusmeIstatElement.innerHTML = `
                <div class="alert alert-info">
                    <h4 class="alert-heading">Görüşme Özeti</h4>
                    <p class="mb-0">
                        Toplam Görüşme: ${gorusmeSayisi}<br>
                        Görüşülen Veli: ${gorusmeYapilanVeliler.size}
                    </p>
                </div>
            `;
        }

        // Günlük detaylı raporu göster
        const gunlukRaporElement = document.getElementById('gunlukRapor');
        if (gunlukRaporElement) {
            const gunlukRaporHTML = Object.entries(gunlukDersler)
                .sort(([a], [b]) => new Date(b) - new Date(a))
                .map(([tarih, kayitlar]) => `
                    <div class="border-bottom py-2">
                        <h6>${new Date(tarih).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h6>
                        ${kayitlar.sort((a, b) => a.saat.localeCompare(b.saat)).map(kayit => `
                            <div class="kayit-item ${kayit.tip === 'ders' ? 'bg-light' : 'bg-light-warning'}">
                                <strong>${kayit.saat}</strong> - ${kayit.ogrenci}<br>
                                <small class="text-muted">
                                    ${kayit.tip === 'ders' ? 
                                        `Ders: ${kayit.konu}<br>Öğretmen: ${kayit.ogretmen}` : 
                                        `Veli Görüşmesi<br>Görüşen: ${kayit.ogretmen}<br>Not: ${kayit.not}`}
                                </small>
                            </div>
                        `).join('')}
                    </div>
                `).join('') || '<p class="text-muted">Seçilen tarih aralığında kayıt bulunmuyor.</p>';

            gunlukRaporElement.innerHTML = gunlukRaporHTML;
        }
    }

    filtreleriTemizle() {
        document.getElementById('aramaIsim').value = '';
        document.getElementById('aramaSinif').value = '';
        document.getElementById('aramaOgretmen').value = '';
        this.kartlariGoster();
    }

    notlariGoster(notlar) {
        return notlar.slice(-2).reverse().map(not => `
            <div class="not-item small text-muted">
                <i class="fas fa-sticky-note"></i> ${not.metin}
                <small>(${not.tarih})</small>
            </div>
        `).join('');
    }

    hizliNotEkle(ogrenciId) {
        const notInput = document.getElementById(`hizliNot_${ogrenciId}`);
        const notMetni = notInput.value.trim();
        
        if (!notMetni) return;

        const ogrenci = this.ogrenciler.find(o => o.id === ogrenciId);
        if (!ogrenci.notlar) ogrenci.notlar = [];

        ogrenci.notlar.push({
            metin: notMetni,
            tarih: new Date().toLocaleString()
        });

        this.kaydet();
        this.kartlariGoster();
        notInput.value = '';
    }

    ogretmenYonetimiGoster() {
        this.ogretmenListesiniGuncelle();
        new bootstrap.Modal(document.getElementById('ogretmenYonetimiModal')).show();
    }

    ogretmenListesiniGuncelle() {
        const liste = document.getElementById('ogretmenListesi');
        liste.innerHTML = this.ogretmenler.map(ogretmen => `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                    <strong>${ogretmen.ad}</strong>
                    <small class="text-muted">(${ogretmen.brans})</small>
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-primary me-1" 
                            onclick="sistem.ogretmenDuzenle(${ogretmen.id})">
                        Düzenle
                    </button>
                    <button class="btn btn-sm btn-outline-danger" 
                            onclick="sistem.ogretmenSil(${ogretmen.id})">
                        Sil
                    </button>
                </div>
            </div>
        `).join('');
    }

    ogretmenKaydet() {
        const id = document.getElementById('ogretmenId').value;
        const yeniOgretmen = {
            id: id ? parseInt(id) : Date.now(),
            ad: document.getElementById('ogretmenAdi').value,
            brans: document.getElementById('ogretmenBrans').value
        };

        if (id) {
            const index = this.ogretmenler.findIndex(o => o.id == id);
            this.ogretmenler[index] = yeniOgretmen;
        } else {
            this.ogretmenler.push(yeniOgretmen);
        }

        this.ogretmenleriKaydet();
        this.ogretmenListesiniGuncelle();
        document.getElementById('ogretmenForm').reset();
    }

    ogretmenDuzenle(id) {
        const ogretmen = this.ogretmenler.find(o => o.id === id);
        if (!ogretmen) return;

        document.getElementById('ogretmenId').value = ogretmen.id;
        document.getElementById('ogretmenAdi').value = ogretmen.ad;
        document.getElementById('ogretmenBrans').value = ogretmen.brans;
    }

    ogretmenSil(id) {
        if (!confirm('Bu öğretmeni silmek istediğinizden emin misiniz?')) return;

        this.ogretmenler = this.ogretmenler.filter(o => o.id !== id);
        this.ogretmenleriKaydet();
        this.ogretmenListesiniGuncelle();
    }

    ogretmenleriKaydet() {
        localStorage.setItem('ogretmenler', JSON.stringify(this.ogretmenler));
    }
}

// Sistemi başlat
const sistem = new OgrenciTakipSistemi();
window.sistem = sistem; 