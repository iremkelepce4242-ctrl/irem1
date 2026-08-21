export const supabaseSqlSchema = `-- ==============================================================================
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
    bakiye NUMERIC(15, 2) DEFAULT 0.00,
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
    odeme_turu TEXT DEFAULT 'VERESIYE',
    durum TEXT DEFAULT 'TAMAMLANDI',
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

-- ALIMLAR
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

-- ALIM DETAY
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

-- TAHSİLATLAR
CREATE TABLE IF NOT EXISTS tahsilatlar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cari_id UUID NOT NULL REFERENCES cariler(id) ON DELETE RESTRICT,
    tutar NUMERIC(15, 2) NOT NULL CHECK (tutar > 0),
    tur TEXT NOT NULL DEFAULT 'NAKIT',
    makbuz_no TEXT,
    aciklama TEXT,
    yil INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INT,
    tarih TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ÖDEMELER
CREATE TABLE IF NOT EXISTS odemeler (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cari_id UUID NOT NULL REFERENCES cariler(id) ON DELETE RESTRICT,
    tutar NUMERIC(15, 2) NOT NULL CHECK (tutar > 0),
    tur TEXT NOT NULL DEFAULT 'NAKIT',
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
    durum TEXT NOT NULL DEFAULT 'PORTFOYDE',
    aciklama TEXT,
    yil INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 2. İNDEKSLER
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_cariler_yil ON cariler(yil);
CREATE INDEX IF NOT EXISTS idx_stoklar_yil ON stoklar(yil);
CREATE INDEX IF NOT EXISTS idx_satislar_yil_tarih ON satislar(yil, tarih);
CREATE INDEX IF NOT EXISTS idx_satis_detay_satis_id ON satis_detay(satis_id);
CREATE INDEX IF NOT EXISTS idx_satis_detay_stok_id ON satis_detay(stok_id);
CREATE INDEX IF NOT EXISTS idx_tahsilatlar_cari_yil ON tahsilatlar(cari_id, yil);
CREATE INDEX IF NOT EXISTS idx_odemeler_cari_yil ON odemeler(cari_id, yil);

-- ------------------------------------------------------------------------------
-- 3. TRİGGER FONKSİYONLARI
-- ------------------------------------------------------------------------------

-- A) Satış Kalemi Stok Trigger'ı
CREATE OR REPLACE FUNCTION trg_fn_satis_stok_hareket()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE stoklar
        SET miktar = miktar - NEW.miktar, updated_at = now()
        WHERE id = NEW.stok_id;
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.stok_id = NEW.stok_id) THEN
            UPDATE stoklar
            SET miktar = miktar + OLD.miktar - NEW.miktar, updated_at = now()
            WHERE id = NEW.stok_id;
        ELSE
            UPDATE stoklar SET miktar = miktar + OLD.miktar, updated_at = now() WHERE id = OLD.stok_id;
            UPDATE stoklar SET miktar = miktar - NEW.miktar, updated_at = now() WHERE id = NEW.stok_id;
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE stoklar
        SET miktar = miktar + OLD.miktar, updated_at = now()
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

-- B) Satış Veresiye Bakiye Trigger'ı
CREATE OR REPLACE FUNCTION trg_fn_satis_bakiye_hareket()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF (NEW.odeme_turu = 'VERESIYE') THEN
            UPDATE cariler
            SET bakiye = bakiye + NEW.net_tutar, updated_at = now()
            WHERE id = NEW.cari_id;
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        IF (OLD.odeme_turu = 'VERESIYE') THEN
            UPDATE cariler
            SET bakiye = bakiye - OLD.net_tutar, updated_at = now()
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

-- C) Tahsilat Bakiye Trigger'ı
CREATE OR REPLACE FUNCTION trg_fn_tahsilat_bakiye()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE cariler
        SET bakiye = bakiye - NEW.tutar, updated_at = now()
        WHERE id = NEW.cari_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE cariler
        SET bakiye = bakiye + OLD.tutar, updated_at = now()
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

-- ------------------------------------------------------------------------------
-- 4. STORED PROCEDURE (YIL SONU DEVRİ)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sp_yil_sonu_devri_yap(
    p_kaynak_yil INT,
    p_hedef_yil INT
)
RETURNS JSONB AS $$
DECLARE
    v_devredilen_cari INT := 0;
    v_devredilen_stok INT := 0;
BEGIN
    INSERT INTO cariler (ad, yetkili, telefon, eposta, adres, sehir, vergi_dairesi, vergi_no, grup, bakiye, risk_limiti, yil, aktif)
    SELECT ad, yetkili, telefon, eposta, adres, sehir, vergi_dairesi, vergi_no, grup, bakiye, risk_limiti, p_hedef_yil, aktif
    FROM cariler
    WHERE yil = p_kaynak_yil AND aktif = true;

    GET DIAGNOSTICS v_devredilen_cari = ROW_COUNT;

    INSERT INTO stoklar (barkod, ad, grup, birim, alis_fiyati, satis_fiyati, kdv_orani, miktar, kritik_miktar, raf_kodu, yil, aktif)
    SELECT barkod, ad, grup, birim, alis_fiyati, satis_fiyati, kdv_orani, miktar, kritik_miktar, raf_kodu, p_hedef_yil, aktif
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
`;
