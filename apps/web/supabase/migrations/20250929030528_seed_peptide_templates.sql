-- Insert seed data for common peptide templates
INSERT INTO peptide_templates (name, category, typical_dose_range, safety_notes, description) VALUES
-- Weight Loss Peptides
('Semaglutide', 'weight_loss', '{"min": 0.25, "max": 2.4, "unit": "mg", "frequency": "weekly"}',
 ARRAY['Start with lowest dose and titrate slowly', 'Monitor for nausea and GI side effects', 'Contraindicated in personal/family history of medullary thyroid carcinoma'],
 'GLP-1 receptor agonist for weight management and blood sugar control'),

('Tirzepatide', 'weight_loss', '{"min": 2.5, "max": 15, "unit": "mg", "frequency": "weekly"}',
 ARRAY['Titrate dose every 4 weeks', 'Monitor for GI side effects', 'Check kidney function regularly'],
 'Dual GIP/GLP-1 receptor agonist for enhanced weight loss and metabolic benefits'),

('AOD-9604', 'weight_loss', '{"min": 250, "max": 500, "unit": "mcg", "frequency": "daily"}',
 ARRAY['Best administered on empty stomach', 'Avoid eating for 2 hours after injection', 'Generally well tolerated'],
 'Fragment of human growth hormone designed specifically for fat burning'),

-- Muscle Building & Recovery
('BPC-157', 'recovery', '{"min": 200, "max": 500, "unit": "mcg", "frequency": "daily"}',
 ARRAY['Can be injected locally near injury site', 'Stable in gastric acid', 'No known serious side effects'],
 'Body protection compound for healing and recovery of tissues'),

('TB-500', 'recovery', '{"min": 2, "max": 5, "unit": "mg", "frequency": "twice_weekly"}',
 ARRAY['Loading phase may require higher frequency', 'Can cause temporary tiredness', 'Monitor injection sites'],
 'Thymosin Beta-4 fragment for enhanced healing and recovery'),

('IGF-1 LR3', 'muscle_building', '{"min": 20, "max": 100, "unit": "mcg", "frequency": "daily"}',
 ARRAY['Highly anabolic - use with caution', 'Monitor blood glucose levels', 'Cycle on/off recommended'],
 'Long-acting insulin-like growth factor for muscle growth'),

('CJC-1295/Ipamorelin', 'muscle_building', '{"min": 100, "max": 300, "unit": "mcg", "frequency": "daily"}',
 ARRAY['Best taken before bed or post-workout', 'May cause water retention', 'Avoid food 2 hours before/after'],
 'Growth hormone releasing peptide combination for muscle growth and recovery'),

-- Longevity & Anti-Aging
('NAD+', 'longevity', '{"min": 50, "max": 500, "unit": "mg", "frequency": "weekly"}',
 ARRAY['Can cause mild nausea initially', 'Start with lower doses', 'Administer slowly'],
 'Nicotinamide adenine dinucleotide for cellular energy and longevity'),

('Epithalon', 'longevity', '{"min": 5, "max": 10, "unit": "mg", "frequency": "daily"}',
 ARRAY['Typically cycled 10 days on, 10 days off', 'Best taken in evening', 'May improve sleep quality'],
 'Telomerase activator for longevity and cellular health'),

-- Cognitive Enhancement
('Selank', 'cognitive', '{"min": 250, "max": 500, "unit": "mcg", "frequency": "daily"}',
 ARRAY['Non-addictive anxiolytic', 'Can be taken nasally or injected', 'May improve focus and reduce anxiety'],
 'Synthetic peptide for cognitive enhancement and anxiety reduction'),

('Noopept', 'cognitive', '{"min": 10, "max": 30, "unit": "mg", "frequency": "daily"}',
 ARRAY['Start with lower doses', 'Can be taken orally or nasally', 'May cause headaches initially'],
 'Racetam-like nootropic for cognitive enhancement and neuroprotection');

-- Update peptide_templates to include Jay Campbell content references for applicable peptides
UPDATE peptide_templates SET jay_content_id = 'semaglutide-guide' WHERE name = 'Semaglutide';
UPDATE peptide_templates SET jay_content_id = 'bpc157-protocol' WHERE name = 'BPC-157';
UPDATE peptide_templates SET jay_content_id = 'peptide-stack-guide' WHERE name = 'CJC-1295/Ipamorelin';