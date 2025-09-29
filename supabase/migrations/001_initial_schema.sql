-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  preferences JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'expert')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Peptide templates table (global library)
CREATE TABLE IF NOT EXISTS peptide_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('weight_loss', 'muscle_building', 'recovery', 'longevity', 'cognitive', 'other')),
  typical_dose_range JSONB NOT NULL,
  safety_notes TEXT[] DEFAULT '{}',
  jay_content_id TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Peptides table (user's custom peptides)
CREATE TABLE IF NOT EXISTS peptides (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_custom BOOLEAN DEFAULT false,
  category TEXT NOT NULL CHECK (category IN ('weight_loss', 'muscle_building', 'recovery', 'longevity', 'cognitive', 'other')),
  typical_dose_range JSONB NOT NULL,
  safety_notes TEXT[] DEFAULT '{}',
  jay_content_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Protocols table
CREATE TABLE IF NOT EXISTS protocols (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  peptide_id UUID REFERENCES peptides(id) ON DELETE CASCADE NOT NULL,
  schedule JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Injections table
CREATE TABLE IF NOT EXISTS injections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  peptide_id UUID REFERENCES peptides(id) ON DELETE CASCADE NOT NULL,
  dose DECIMAL(10,2) NOT NULL,
  dose_unit TEXT NOT NULL CHECK (dose_unit IN ('mg', 'mcg', 'iu', 'ml', 'units')),
  injection_site JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  protocol_id UUID REFERENCES protocols(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Wellness metrics table
CREATE TABLE IF NOT EXISTS wellness_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('weight', 'body_fat', 'muscle_mass', 'energy_level', 'sleep_quality', 'mood', 'other')),
  value DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  injection_id UUID REFERENCES injections(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX idx_peptides_user_id ON peptides(user_id);
CREATE INDEX idx_protocols_user_id ON protocols(user_id);
CREATE INDEX idx_injections_user_id ON injections(user_id);
CREATE INDEX idx_injections_timestamp ON injections(timestamp);
CREATE INDEX idx_wellness_metrics_user_id ON wellness_metrics(user_id);
CREATE INDEX idx_wellness_metrics_timestamp ON wellness_metrics(timestamp);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_timestamp_users
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_peptide_templates
  BEFORE UPDATE ON peptide_templates
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_peptides
  BEFORE UPDATE ON peptides
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_protocols
  BEFORE UPDATE ON protocols
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_injections
  BEFORE UPDATE ON injections
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_wellness_metrics
  BEFORE UPDATE ON wellness_metrics
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- Insert some default peptide templates
INSERT INTO peptide_templates (name, category, typical_dose_range, safety_notes, description) VALUES
  ('Semaglutide', 'weight_loss', '{"min": 0.25, "max": 2.5, "unit": "mg", "frequency": "weekly"}', ARRAY['Start with low dose', 'Monitor for GI side effects'], 'GLP-1 receptor agonist for weight management'),
  ('Tirzepatide', 'weight_loss', '{"min": 2.5, "max": 15, "unit": "mg", "frequency": "weekly"}', ARRAY['Titrate dose gradually', 'Monitor blood glucose'], 'Dual GIP/GLP-1 receptor agonist'),
  ('BPC-157', 'recovery', '{"min": 250, "max": 500, "unit": "mcg", "frequency": "daily"}', ARRAY['Inject near injury site if applicable'], 'Body Protection Compound for tissue repair'),
  ('TB-500', 'recovery', '{"min": 2, "max": 10, "unit": "mg", "frequency": "weekly"}', ARRAY['Loading phase may be beneficial'], 'Thymosin Beta-4 fragment for recovery'),
  ('CJC-1295', 'muscle_building', '{"min": 1, "max": 2, "unit": "mg", "frequency": "weekly"}', ARRAY['Best taken before bed', 'May cause water retention'], 'Growth hormone releasing hormone analog'),
  ('Ipamorelin', 'muscle_building', '{"min": 200, "max": 300, "unit": "mcg", "frequency": "daily"}', ARRAY['Take on empty stomach'], 'Growth hormone releasing peptide'),
  ('Epithalon', 'longevity', '{"min": 5, "max": 10, "unit": "mg", "frequency": "daily"}', ARRAY['Cycled use recommended'], 'Telomerase activator peptide'),
  ('Semax', 'cognitive', '{"min": 0.25, "max": 1, "unit": "mg", "frequency": "daily"}', ARRAY['Intranasal administration common'], 'Nootropic peptide for cognitive enhancement')
ON CONFLICT DO NOTHING;