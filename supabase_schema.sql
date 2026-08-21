-- ==============================================================================
-- STOK VE CARİ TAKİP - SUPABASE POSTGRESQL VERİTABANI ŞEMASI
-- ==============================================================================
-- Bu dosya Supabase SQL Editor'de doğrudan çalıştırılabilir.
-- Özellikler:
-- 1. Yıl (yil: INT) etiketli hareket ve bakiye tabloları (Yıl sonu devri için optimize)
-- 2. Akıllı PostgreSQL Trigger'ları (Stok düşme/ekleme, cari bakiye otomatik hesaplama)
-- 3. Stored Procedure (RPC) Raporlama (Android'e binlerce satır yerine tek JSON döner)
-- 4. Row Level Security (RLS) ve Performans İndeksleri
-- ==============================================================================

-- UUID Uzantısını etkinleştir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. TABLOLAR
-- ------------------------------------------------------------------------------

-- CARİ GRUPLARI
CREATE TABLE IF NOT EXISTS cari_gruplari (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad TEXT NOT NULL UNIQUE,
    aciklama TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- STOK GRUPLARI / KATEGORİLER
CREATE TABLE IF NOT EXISTS stok_gruplari (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad TEXT NOT NULL UNIQUE,
    aciklama TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- CARİLER TABLOSU
CREATE TABLE IF NOT EXISTS cariler (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad TEXT NOT NULL,
    yetkili TEXT,
    telefon TEXT,
    eposta TEXT,
    adres TEXT,
    sehir TEXT,
    vergi_dairesi TEXT,
    vergi_no TEXT,
    grup TEXT DEFAULT 'Genel',
    bakiye NUMERIC(15, 2) DEFAULT 0.00, -- Pozitif: Müşteri borçlu, Negatif: Biz borçluyuz
    risk_limiti NUMERIC(15, 2) DEFAULT 0.00,
    yil INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INT,
    aktif BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- STOKLAR TABLOSU
CREATE TABLE IF NOT EXISTS stoklar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barkod TEXT,
    ad TEXT NOT NULL,
    grup TEXT DEFAULT 'Genel',
    birim TEXT DEFAULT 'Adet',
    alis_fiyati NUMERIC(15, 2) DEFAULT 0.00,
    satis_fiyati NUMERIC(15, 2) DEFAULT 0.00,
    kdv_orani INT DEFAULT 20,
    miktar NUMERIC(15, 3) DEFAULT 0.000,
    kritik_miktar NUMERIC(15, 3) DEFAULT 5.000,
    raf_kodu TEXT,
    yil INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INT,
    aktif BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- SATIŞLAR (FATURA / FİŞ ÜST BİLGİLERİ)
CREATE TABLE IF NOT EXISTS satislar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fatura_no TEXT NOT NULL,
    cari_id UUID NOT NULL REFERENCES cariler(id) ON DELETE RESTRICT,
    toplam_tutar NUMERIC(15, 2) DEFAULT 0.00,
    iskonto_tutari NUMERIC(15, 2) DEFAULT 0.00,
    net_tutar NUMERIC(15, 2) DEFAULT 0.00,
    odeme_turu TEXT DEFAULT 'VERESIYE', -- 'NAKIT', 'KREDI_KARTI', 'VERESIYE', 'HAVALE'
    durum TEXT DEFAULT 'TAMAMLANDI', -- 'TAMAMLANDI', 'IPTAL'
    aciklama TEXT,
    yil INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INT,
    tarih TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- SATIŞ DETAY (KALEMLER)
CREATE TABLE IF NOT EXISTS satis_detay (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    satis_id UUID NOT NULL REFERENCES satislar(id) ON DELETE CASCADE,
    stok_id UUID NOT NULL REFERENCES stoklar(id) ON DELETE RESTRICT,
    miktar NUMERIC(15, 3) NOT NULL CHECK (miktar > 0),
    birim_fiyat NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    kdv_orani INT DEFAULT 20,
    iskonto_orani NUMERIC(5, 2) DEFAULT 0.00,
    toplam_tutar NUMERIC(15, 2) NOT NULL,
    yil INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ALIMLAR (ALIŞ FATURASI / MAL ALIMI)
CREATE TABLE IF NOT EXISTS alimlar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fatura_no TEXT NOT NULL,
    cari_id UUID NOT NULL REFERENCES cariler(id) ON DELETE RESTRICT,
    toplam_tutar NUMERIC(15, 2) DEFAULT 0.00,
    iskonto_tutari NUMERIC(15, 2) DEFAULT 0.00,
    net_tutar NUMERIC(15, 2) DEFAULT 0.00,
    odeme_turu TEXT DEFAULT 'VERESIYE',
    durum TEXT DEFAULT 'TAMAMLANDI',
    aciklama TEXT,
    yil INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INT,
    tarih TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ALIM DETAY (KALEMLER)
CREATE TABLE IF NOT EXISTS alim_detay (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alim_id UUID NOT NULL REFERENCES alimlar(id) ON DELETE CASCADE,
    stok_id UUID NOT NULL REFERENCES stoklar(id) ON DELETE RESTRICT,
    miktar NUMERIC(15, 3) NOT NULL CHECK (miktar > 0),
    birim_fiyat NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    kdv_orani INT DEFAULT 20,
    iskonto_orani NUMERIC(5, 2) DEFAULT 0.00,
    toplam_tutar NUMERIC(15, 2) NOT NULL,
    yil INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- TAHSİLATLAR (MÜŞTERİDEN ALINAN PARA)
CREATE TABLE IF NOT EXISTS tahsilatlar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cari_id UUID NOT NULL REFERENCES cariler(id) ON DELETE RESTRICT,
    tutar NUMERIC(15, 2) NOT NULL CHECK (tutar > 0),
    tur TEXT NOT NULL DEFAULT 'NAKIT', -- 'NAKIT', 'KREDI_KARTI', 'HAVALE', 'CEK', 'SENET'
    makbuz_no TEXT,
    aciklama TEXT,
    yil INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INT,
    tarih TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ÖDEMELER (TEDARİKÇİYE / CARİYE YAPILAN ÖDEME)
CREATE TABLE IF NOT EXISTS odemeler (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cari_id UUID NOT NULL REFERENCES cariler(id) ON DELETE RESTRICT,
    tutar NUMERIC(15, 2) NOT NULL CHECK (tutar > 0),
    tur TEXT NOT NULL DEFAULT 'NAKIT', -- 'NAKIT', 'HAVALE', 'KREDI_KARTI', 'CEK'
    makbuz_no TEXT,
    aciklama TEXT,
    yil INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INT,
    tarih TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ÇEK VE SENET TAKİBİ
CREATE TABLE IF NOT EXISTS cek_senetler (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cari_id UUID NOT NULL REFERENCES cariler(id) ON DELETE RESTRICT,
    tip TEXT NOT NULL CHECK (tip IN ('CEK', 'SENET')),
    islem_turu TEXT NOT NULL CHECK (islem_turu IN ('ALINAN', 'VERILEN')),
    evrak_no TEXT NOT NULL,
    banka TEXT,
    sube TEXT,
    hesap_no TEXT,
    kesideci TEXT,
    vade_tarihi DATE NOT NULL,
    tutar NUMERIC(15, 2) NOT NULL CHECK (tutar > 0),
    durum TEXT NOT NULL DEFAULT 'PORTFOYDE', -- 'PORTFOYDE', 'TAHSIL_EDILDI', 'ODENDI', 'KARSILIKSIZ', 'IADE'
    aciklama TEXT,
    yil INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- TEKLİFLER
CREATE TABLE IF NOT EXISTS teklifler (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teklif_no TEXT NOT NULL,
    cari_id UUID NOT NULL REFERENCES cariler(id) ON DELETE RESTRICT,
    toplam_tutar NUMERIC(15, 2) DEFAULT 0.00,
    durum TEXT DEFAULT 'BEKLEMEDE', -- 'BEKLEMEDE', 'ONAYLANDI', 'REDDEDILDI'
    gecerlilik_tarihi DATE,
    aciklama TEXT,
    yil INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teklif_detay (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teklif_id UUID NOT NULL REFERENCES teklifler(id) ON DELETE CASCADE,
    stok_id UUID NOT NULL REFERENCES stoklar(id) ON DELETE RESTRICT,
    miktar NUMERIC(15, 3) NOT NULL,
    birim_fiyat NUMERIC(15, 2) NOT NULL,
    toplam_tutar NUMERIC(15, 2) NOT NULL,
    yil INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INT
);

-- ------------------------------------------------------------------------------
-- 2. İNDEKSLER (YIL VE PERFORMANS İÇİN)
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_cariler_yil ON cariler(yil);
CREATE INDEX IF NOT EXISTS idx_stoklar_yil ON stoklar(yil);
CREATE INDEX IF NOT EXISTS idx_satislar_yil_tarih ON satislar(yil, tarih);
CREATE INDEX IF NOT EXISTS idx_satis_detay_satis_id ON satis_detay(satis_id);
CREATE INDEX IF NOT EXISTS idx_satis_detay_stok_id ON satis_detay(stok_id);
CREATE INDEX IF NOT EXISTS idx_alimlar_yil_tarih ON alimlar(yil, tarih);
CREATE INDEX IF NOT EXISTS idx_alim_detay_alim_id ON alim_detay(alim_id);
CREATE INDEX IF NOT EXISTS idx_tahsilatlar_cari_yil ON tahsilatlar(cari_id, yil);
CREATE INDEX IF NOT EXISTS idx_odemeler_cari_yil ON odemeler(cari_id, yil);
CREATE INDEX IF NOT EXISTS idx_cek_senetler_vade ON cek_senetler(vade_tarihi, durum);

-- ------------------------------------------------------------------------------
-- 3. TRİGGER FONKSİYONLARI (AKILLI VERİTABANI MİMARİSİ)
-- ------------------------------------------------------------------------------

-- A) SATIŞ YAPILINCA / DÜZENLENİNCE / SİLİNİNCE STOK MİKTARINI GÜNCELLE
CREATE OR REPLACE FUNCTION trg_fn_satis_stok_hareket()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Yeni satış kalemi: Stoktan düş
        UPDATE stoklar
        SET miktar = miktar - NEW.miktar,
            updated_at = now()
        WHERE id = NEW.stok_id;
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Satış kalemi miktarı veya stoku değiştiyse farkı ayarla
        IF (OLD.stok_id = NEW.stok_id) THEN
            UPDATE stoklar
            SET miktar = miktar + OLD.miktar - NEW.miktar,
                updated_at = now()
            WHERE id = NEW.stok_id;
        ELSE
            -- Stok değiştiyse eskiye geri ekle, yenisinden düş
            UPDATE stoklar SET miktar = miktar + OLD.miktar, updated_at = now() WHERE id = OLD.stok_id;
            UPDATE stoklar SET miktar = miktar - NEW.miktar, updated_at = now() WHERE id = NEW.stok_id;
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        -- Satış kalemi silinince stoğu geri iade et
        UPDATE stoklar
        SET miktar = miktar + OLD.miktar,
            updated_at = now()
        WHERE id = OLD.stok_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_satis_stok ON satis_detay;
CREATE TRIGGER trg_satis_stok
AFTER INSERT OR UPDATE OR DELETE ON satis_detay
FOR EACH ROW EXECUTE FUNCTION trg_fn_satis_stok_hareket();


-- B) ALIM YAPILINCA / DÜZENLENİNCE / SİLİNİNCE STOK MİKTARINI GÜNCELLE
CREATE OR REPLACE FUNCTION trg_fn_alim_stok_hareket()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Yeni alım: Stoğa ekle
        UPDATE stoklar
        SET miktar = miktar + NEW.miktar,
            updated_at = now()
        WHERE id = NEW.stok_id;
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.stok_id = NEW.stok_id) THEN
            UPDATE stoklar
            SET miktar = miktar - OLD.miktar + NEW.miktar,
                updated_at = now()
            WHERE id = NEW.stok_id;
        ELSE
            UPDATE stoklar SET miktar = miktar - OLD.miktar, updated_at = now() WHERE id = OLD.stok_id;
            UPDATE stoklar SET miktar = miktar + NEW.miktar, updated_at = now() WHERE id = NEW.stok_id;
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        -- Alım silinince stoktan geri düş
        UPDATE stoklar
        SET miktar = miktar - OLD.miktar,
            updated_at = now()
        WHERE id = OLD.stok_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_alim_stok ON alim_detay;
CREATE TRIGGER trg_alim_stok
AFTER INSERT OR UPDATE OR DELETE ON alim_detay
FOR EACH ROW EXECUTE FUNCTION trg_fn_alim_stok_hareket();


-- C) SATIŞ TOPLAMINI VE CARİ BAKİYEYİ GÜNCELLE (SATIŞ BAŞLIK HAREKETİ)
CREATE OR REPLACE FUNCTION trg_fn_satis_bakiye_hareket()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Veresiye ise cari borcu artar
        IF (NEW.odeme_turu = 'VERESIYE') THEN
            UPDATE cariler
            SET bakiye = bakiye + NEW.net_tutar,
                updated_at = now()
            WHERE id = NEW.cari_id;
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.odeme_turu = 'VERESIYE') THEN
            UPDATE cariler SET bakiye = bakiye - OLD.net_tutar WHERE id = OLD.cari_id;
        END IF;
        IF (NEW.odeme_turu = 'VERESIYE') THEN
            UPDATE cariler SET bakiye = bakiye + NEW.net_tutar WHERE id = NEW.cari_id;
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        IF (OLD.odeme_turu = 'VERESIYE') THEN
            UPDATE cariler
            SET bakiye = bakiye - OLD.net_tutar,
                updated_at = now()
            WHERE id = OLD.cari_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_satis_bakiye ON satislar;
CREATE TRIGGER trg_satis_bakiye
AFTER INSERT OR UPDATE OR DELETE ON satislar
FOR EACH ROW EXECUTE FUNCTION trg_fn_satis_bakiye_hareket();


-- D) ALIM BAŞLIK HAREKETİ (ALIM VERESİYE İSE CARİ ALACAĞI ARTAR / BİZİM BORCUMUZ ARTAR: BAKİYE DÜŞER)
CREATE OR REPLACE FUNCTION trg_fn_alim_bakiye_hareket()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF (NEW.odeme_turu = 'VERESIYE') THEN
            UPDATE cariler
            SET bakiye = bakiye - NEW.net_tutar,
                updated_at = now()
            WHERE id = NEW.cari_id;
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.odeme_turu = 'VERESIYE') THEN
            UPDATE cariler SET bakiye = bakiye + OLD.net_tutar WHERE id = OLD.cari_id;
        END IF;
        IF (NEW.odeme_turu = 'VERESIYE') THEN
            UPDATE cariler SET bakiye = bakiye - NEW.net_tutar WHERE id = NEW.cari_id;
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        IF (OLD.odeme_turu = 'VERESIYE') THEN
            UPDATE cariler
            SET bakiye = bakiye + OLD.net_tutar,
                updated_at = now()
            WHERE id = OLD.cari_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_alim_bakiye ON alimlar;
CREATE TRIGGER trg_alim_bakiye
AFTER INSERT OR UPDATE OR DELETE ON alimlar
FOR EACH ROW EXECUTE FUNCTION trg_fn_alim_bakiye_hareket();


-- E) TAHSİLAT HAREKETİ (MÜŞTERİ ÖDEDİKÇE BORCU DÜŞER)
CREATE OR REPLACE FUNCTION trg_fn_tahsilat_bakiye()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE cariler
        SET bakiye = bakiye - NEW.tutar,
            updated_at = now()
        WHERE id = NEW.cari_id;
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        UPDATE cariler
        SET bakiye = bakiye + OLD.tutar - NEW.tutar,
            updated_at = now()
        WHERE id = NEW.cari_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE cariler
        SET bakiye = bakiye + OLD.tutar,
            updated_at = now()
        WHERE id = OLD.cari_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tahsilat_bakiye ON tahsilatlar;
CREATE TRIGGER trg_tahsilat_bakiye
AFTER INSERT OR UPDATE OR DELETE ON tahsilatlar
FOR EACH ROW EXECUTE FUNCTION trg_fn_tahsilat_bakiye();


-- F) ÖDEME HAREKETİ (BİZ TEDARİKÇİYE ÖDEDİKÇE BORCUMUZ KAPANIR / BAKİYE ARTAR)
CREATE OR REPLACE FUNCTION trg_fn_odeme_bakiye()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE cariler
        SET bakiye = bakiye + NEW.tutar,
            updated_at = now()
        WHERE id = NEW.cari_id;
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        UPDATE cariler
        SET bakiye = bakiye - OLD.tutar + NEW.tutar,
            updated_at = now()
        WHERE id = NEW.cari_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE cariler
        SET bakiye = bakiye - OLD.tutar,
            updated_at = now()
        WHERE id = OLD.cari_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_odeme_bakiye ON odemeler;
CREATE TRIGGER trg_odeme_bakiye
AFTER INSERT OR UPDATE OR DELETE ON odemeler
FOR EACH ROW EXECUTE FUNCTION trg_fn_odeme_bakiye();


-- ------------------------------------------------------------------------------
-- 4. STORED PROCEDURES / RPC FONKSİYONLARI (HAFİF ANDROID İÇİN)
-- ------------------------------------------------------------------------------

-- 1. YILLIK ÖZET RAPOR (Android'e tek satır JSON döner)
CREATE OR REPLACE FUNCTION get_yillik_ozet_rapor(p_yil INT)
RETURNS JSONB AS $$
DECLARE
    v_toplam_satis NUMERIC(15, 2) := 0;
    v_satis_adedi INT := 0;
    v_toplam_alim NUMERIC(15, 2) := 0;
    v_alim_adedi INT := 0;
    v_toplam_tahsilat NUMERIC(15, 2) := 0;
    v_toplam_odeme NUMERIC(15, 2) := 0;
    v_toplam_alacak NUMERIC(15, 2) := 0; -- Carilerden toplam alacağımız (bakiye > 0)
    v_toplam_borc NUMERIC(15, 2) := 0;   -- Carilere toplam borcumuz (bakiye < 0)
    v_kritik_stok_sayisi INT := 0;
    v_aylik_satislar JSONB;
    v_en_cok_satanlar JSONB;
BEGIN
    -- Satış toplamları
    SELECT COALESCE(SUM(net_tutar), 0), COUNT(id)
    INTO v_toplam_satis, v_satis_adedi
    FROM satislar
    WHERE yil = p_yil AND durum = 'TAMAMLANDI';

    -- Alım toplamları
    SELECT COALESCE(SUM(net_tutar), 0), COUNT(id)
    INTO v_toplam_alim, v_alim_adedi
    FROM alimlar
    WHERE yil = p_yil AND durum = 'TAMAMLANDI';

    -- Tahsilatlar
    SELECT COALESCE(SUM(tutar), 0)
    INTO v_toplam_tahsilat
    FROM tahsilatlar
    WHERE yil = p_yil;

    -- Ödemeler
    SELECT COALESCE(SUM(tutar), 0)
    INTO v_toplam_odeme
    FROM odemeler
    WHERE yil = p_yil;

    -- Cari Bakiye Toplamları (İlgili yıl)
    SELECT 
        COALESCE(SUM(CASE WHEN bakiye > 0 THEN bakiye ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN bakiye < 0 THEN ABS(bakiye) ELSE 0 END), 0)
    INTO v_toplam_alacak, v_toplam_borc
    FROM cariler
    WHERE yil = p_yil AND aktif = true;

    -- Kritik Stok Sayısı
    SELECT COUNT(id)
    INTO v_kritik_stok_sayisi
    FROM stoklar
    WHERE yil = p_yil AND miktar <= kritik_miktar AND aktif = true;

    -- Aylık Satış Dağılımı (Grafik için)
    SELECT jsonb_agg(
        jsonb_build_object(
            'ay', m.ay,
            'satis_tutari', COALESCE(s.tutar, 0),
            'alim_tutari', COALESCE(a.tutar, 0)
        ) ORDER BY m.ay
    )
    INTO v_aylik_satislar
    FROM generate_series(1, 12) AS m(ay)
    LEFT JOIN (
        SELECT EXTRACT(MONTH FROM tarih)::INT as ay, SUM(net_tutar) as tutar
        FROM satislar
        WHERE yil = p_yil AND durum = 'TAMAMLANDI'
        GROUP BY EXTRACT(MONTH FROM tarih)::INT
    ) s ON s.ay = m.ay
    LEFT JOIN (
        SELECT EXTRACT(MONTH FROM tarih)::INT as ay, SUM(net_tutar) as tutar
        FROM alimlar
        WHERE yil = p_yil AND durum = 'TAMAMLANDI'
        GROUP BY EXTRACT(MONTH FROM tarih)::INT
    ) a ON a.ay = m.ay;

    -- En Çok Satan 5 Ürün
    SELECT COALESCE(jsonb_agg(sub), '[]'::jsonb)
    INTO v_en_cok_satanlar
    FROM (
        SELECT s.ad as stok_adi, SUM(sd.miktar) as toplam_adet, SUM(sd.toplam_tutar) as toplam_tutar
        FROM satis_detay sd
        JOIN stoklar s ON s.id = sd.stok_id
        WHERE sd.yil = p_yil
        GROUP BY s.ad
        ORDER BY toplam_adet DESC
        LIMIT 5
    ) sub;

    RETURN jsonb_build_object(
        'yil', p_yil,
        'toplam_satis', v_toplam_satis,
        'satis_adedi', v_satis_adedi,
        'toplam_alim', v_toplam_alim,
        'alim_adedi', v_alim_adedi,
        'toplam_tahsilat', v_toplam_tahsilat,
        'toplam_odeme', v_toplam_odeme,
        'net_kasa_nakit', (v_toplam_tahsilat - v_toplam_odeme),
        'toplam_cari_alacak', v_toplam_alacak,
        'toplam_cari_borc', v_toplam_borc,
        'kritik_stok_sayisi', v_kritik_stok_sayisi,
        'aylik_grafik', COALESCE(v_aylik_satislar, '[]'::jsonb),
        'en_cok_satanlar', v_en_cok_satanlar
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. CARİ HESAP EKSTRESİ (Tüm hareketleri kümülatif bakiye ile hesaplayıp liste döner)
CREATE OR REPLACE FUNCTION get_cari_hesap_ekstresi(p_cari_id UUID, p_yil INT)
RETURNS TABLE (
    id UUID,
    tarih TIMESTAMPTZ,
    tur TEXT,
    evrak_no TEXT,
    aciklama TEXT,
    borc NUMERIC(15, 2),   -- Müşteri borçlandı (Satış)
    alacak NUMERIC(15, 2)  -- Müşteri ödedi (Tahsilat)
) AS $$
BEGIN
    RETURN QUERY
    -- 1. Satışlar (Borç)
    SELECT 
        s.id,
        s.tarih,
        'SATIŞ'::TEXT as tur,
        s.fatura_no as evrak_no,
        COALESCE(s.aciklama, 'Satış Faturası') as aciklama,
        s.net_tutar as borc,
        0.00::NUMERIC(15, 2) as alacak
    FROM satislar s
    WHERE s.cari_id = p_cari_id AND s.yil = p_yil AND s.durum = 'TAMAMLANDI'

    UNION ALL

    -- 2. Tahsilatlar (Alacak)
    SELECT 
        t.id,
        t.tarih,
        ('TAHSİLAT (' || t.tur || ')') as tur,
        COALESCE(t.makbuz_no, '-') as evrak_no,
        COALESCE(t.aciklama, 'Tahsilat') as aciklama,
        0.00::NUMERIC(15, 2) as borc,
        t.tutar as alacak
    FROM tahsilatlar t
    WHERE t.cari_id = p_cari_id AND t.yil = p_yil

    UNION ALL

    -- 3. Alımlar (Alacak - Tedarikçi ise)
    SELECT 
        a.id,
        a.tarih,
        'ALIM'::TEXT as tur,
        a.fatura_no as evrak_no,
        COALESCE(a.aciklama, 'Alış Faturası') as aciklama,
        0.00::NUMERIC(15, 2) as borc,
        a.net_tutar as alacak
    FROM alimlar a
    WHERE a.cari_id = p_cari_id AND a.yil = p_yil AND a.durum = 'TAMAMLANDI'

    UNION ALL

    -- 4. Ödemeler (Borç - Biz ödedik)
    SELECT 
        o.id,
        o.tarih,
        ('ÖDEME (' || o.tur || ')') as tur,
        COALESCE(o.makbuz_no, '-') as evrak_no,
        COALESCE(o.aciklama, 'Cariye Ödeme') as aciklama,
        o.tutar as borc,
        0.00::NUMERIC(15, 2) as alacak
    FROM odemeler o
    WHERE o.cari_id = p_cari_id AND o.yil = p_yil

    ORDER BY tarih ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. ATOMİK SATIŞ KAYDI OLUŞTURMA RPC'Sİ
CREATE OR REPLACE FUNCTION sp_yeni_satis_kaydet(
    p_cari_id UUID,
    p_fatura_no TEXT,
    p_odeme_turu TEXT,
    p_iskonto NUMERIC,
    p_aciklama TEXT,
    p_yil INT,
    p_kalemler JSONB
)
RETURNS UUID AS $$
DECLARE
    v_satis_id UUID;
    v_toplam_tutar NUMERIC(15, 2) := 0;
    v_net_tutar NUMERIC(15, 2) := 0;
    v_kalem RECORD;
BEGIN
    -- Kalemler üzerinde dönüp toplam hesapla
    FOR v_kalem IN SELECT * FROM jsonb_to_recordset(p_kalemler) AS x(
        stok_id UUID,
        miktar NUMERIC,
        birim_fiyat NUMERIC,
        kdv_orani INT,
        iskonto_orani NUMERIC,
        toplam_tutar NUMERIC
    ) LOOP
        v_toplam_tutar := v_toplam_tutar + v_kalem.toplam_tutar;
    END LOOP;

    v_net_tutar := v_toplam_tutar - COALESCE(p_iskonto, 0);

    -- Satış üst kaydı aç
    INSERT INTO satislar (fatura_no, cari_id, toplam_tutar, iskonto_tutari, net_tutar, odeme_turu, aciklama, yil)
    VALUES (p_fatura_no, p_cari_id, v_toplam_tutar, COALESCE(p_iskonto, 0), v_net_tutar, p_odeme_turu, p_aciklama, p_yil)
    RETURNING id INTO v_satis_id;

    -- Kalemleri ekle (Trigger'lar otomatik olarak stoktan düşecek)
    FOR v_kalem IN SELECT * FROM jsonb_to_recordset(p_kalemler) AS x(
        stok_id UUID,
        miktar NUMERIC,
        birim_fiyat NUMERIC,
        kdv_orani INT,
        iskonto_orani NUMERIC,
        toplam_tutar NUMERIC
    ) LOOP
        INSERT INTO satis_detay (satis_id, stok_id, miktar, birim_fiyat, kdv_orani, iskonto_orani, toplam_tutar, yil)
        VALUES (v_satis_id, v_kalem.stok_id, v_kalem.miktar, v_kalem.birim_fiyat, COALESCE(v_kalem.kdv_orani, 20), COALESCE(v_kalem.iskonto_orani, 0), v_kalem.toplam_tutar, p_yil);
    END LOOP;

    RETURN v_satis_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. YIL SONU DEVİR İŞLEMİ RPC'Sİ (YIL DEVRİ)
CREATE OR REPLACE FUNCTION sp_yil_sonu_devri_yap(
    p_kaynak_yil INT,
    p_hedef_yil INT
)
RETURNS JSONB AS $$
DECLARE
    v_devredilen_cari INT := 0;
    v_devredilen_stok INT := 0;
BEGIN
    -- 1. Carileri devret (Son bakiye ile yeni yıla aktar)
    INSERT INTO cariler (ad, yetkili, telefon, eposta, adres, sehir, vergi_dairesi, vergi_no, grup, bakiye, risk_limiti, yil, aktif)
    SELECT 
        ad, yetkili, telefon, eposta, adres, sehir, vergi_dairesi, vergi_no, grup, bakiye, risk_limiti, p_hedef_yil, aktif
    FROM cariler
    WHERE yil = p_kaynak_yil AND aktif = true;

    GET DIAGNOSTICS v_devredilen_cari = ROW_COUNT;

    -- 2. Stokları devret (Kalan miktar ve güncel fiyat ile yeni yıla aktar)
    INSERT INTO stoklar (barkod, ad, grup, birim, alis_fiyati, satis_fiyati, kdv_orani, miktar, kritik_miktar, raf_kodu, yil, aktif)
    SELECT 
        barkod, ad, grup, birim, alis_fiyati, satis_fiyati, kdv_orani, miktar, kritik_miktar, raf_kodu, p_hedef_yil, aktif
    FROM stoklar
    WHERE yil = p_kaynak_yil AND aktif = true;

    GET DIAGNOSTICS v_devredilen_stok = ROW_COUNT;

    RETURN jsonb_build_object(
        'durum', 'BASARILI',
        'kaynak_yil', p_kaynak_yil,
        'hedef_yil', p_hedef_yil,
        'devredilen_cari_sayisi', v_devredilen_cari,
        'devredilen_stok_sayisi', v_devredilen_stok,
        'mesaj', format('%s yılından %s yılına devir başarıyla tamamlandı.', p_kaynak_yil, p_hedef_yil)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- ------------------------------------------------------------------------------
ALTER TABLE cariler ENABLE ROW LEVEL SECURITY;
ALTER TABLE stoklar ENABLE ROW LEVEL SECURITY;
ALTER TABLE satislar ENABLE ROW LEVEL SECURITY;
ALTER TABLE satis_detay ENABLE ROW LEVEL SECURITY;
ALTER TABLE alimlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE alim_detay ENABLE ROW LEVEL SECURITY;
ALTER TABLE tahsilatlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE odemeler ENABLE ROW LEVEL SECURITY;
ALTER TABLE cek_senetler ENABLE ROW LEVEL SECURITY;
ALTER TABLE teklifler ENABLE ROW LEVEL SECURITY;
ALTER TABLE teklif_detay ENABLE ROW LEVEL SECURITY;

-- Anonim / Yetkili kullanıcı erişim kuralı (İhtiyaca göre auth.uid() eklenebilir)
CREATE POLICY "cariler_all" ON cariler FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "stoklar_all" ON stoklar FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "satislar_all" ON satislar FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "satis_detay_all" ON satis_detay FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "alimlar_all" ON alimlar FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "alim_detay_all" ON alim_detay FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "tahsilatlar_all" ON tahsilatlar FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "odemeler_all" ON odemeler FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "cek_senetler_all" ON cek_senetler FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "teklifler_all" ON teklifler FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "teklif_detay_all" ON teklif_detay FOR ALL USING (true) WITH CHECK (true);
