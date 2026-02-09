-- =============================================
-- Psikolog Panel - Supabase Database Setup
-- Bu SQL'i Supabase Dashboard > SQL Editor'de çalıştırın
-- =============================================

-- Ana veri tablosu (key-value store)
CREATE TABLE IF NOT EXISTS site_data (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER site_data_updated_at
  BEFORE UPDATE ON site_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS: Herkes okuyabilir, herkes yazabilir (admin auth client-side)
ALTER TABLE site_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON site_data
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON site_data
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON site_data
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete" ON site_data
  FOR DELETE USING (true);
