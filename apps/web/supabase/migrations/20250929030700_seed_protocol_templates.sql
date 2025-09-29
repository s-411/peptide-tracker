-- Seed Jay Campbell protocol templates
-- These are global templates that all users can access and customize

-- Get the system peptide IDs for template creation
DO $$
DECLARE
    semaglutide_id UUID;
    tirzepatide_id UUID;
    cjc1295_id UUID;
    ipamorelin_id UUID;
    bpc157_id UUID;
BEGIN
    -- Get peptide IDs (these should exist from the peptide seeding)
    SELECT id INTO semaglutide_id FROM peptides WHERE name = 'Semaglutide' AND user_id IS NULL LIMIT 1;
    SELECT id INTO tirzepatide_id FROM peptides WHERE name = 'Tirzepatide' AND user_id IS NULL LIMIT 1;
    SELECT id INTO cjc1295_id FROM peptides WHERE name = 'CJC-1295' AND user_id IS NULL LIMIT 1;
    SELECT id INTO ipamorelin_id FROM peptides WHERE name = 'Ipamorelin' AND user_id IS NULL LIMIT 1;
    SELECT id INTO bpc157_id FROM peptides WHERE name = 'BPC-157' AND user_id IS NULL LIMIT 1;

    -- Jay Campbell Semaglutide Protocol Templates
    IF semaglutide_id IS NOT NULL THEN
        INSERT INTO protocols (
            user_id, peptide_id, name, weekly_target, schedule_type, schedule_config,
            start_date, is_template, template_name
        ) VALUES
        (
            NULL, semaglutide_id, 'Jay Campbell - Semaglutide Beginner (1mg/week)',
            1.0, 'weekly',
            '{"days": ["sunday"], "notes": "Start low, single weekly dose"}',
            CURRENT_DATE, true, 'Jay Campbell - Semaglutide Beginner'
        ),
        (
            NULL, semaglutide_id, 'Jay Campbell - Semaglutide Standard (2.4mg/week)',
            2.4, 'weekly',
            '{"days": ["sunday"], "notes": "Standard maintenance dose"}',
            CURRENT_DATE, true, 'Jay Campbell - Semaglutide Standard'
        );
    END IF;

    -- Jay Campbell Tirzepatide Protocol Templates
    IF tirzepatide_id IS NOT NULL THEN
        INSERT INTO protocols (
            user_id, peptide_id, name, weekly_target, schedule_type, schedule_config,
            start_date, is_template, template_name
        ) VALUES
        (
            NULL, tirzepatide_id, 'Jay Campbell - Tirzepatide Beginner (2.5mg/week)',
            2.5, 'weekly',
            '{"days": ["sunday"], "notes": "Conservative starting dose"}',
            CURRENT_DATE, true, 'Jay Campbell - Tirzepatide Beginner'
        ),
        (
            NULL, tirzepatide_id, 'Jay Campbell - Tirzepatide Advanced (15mg/week)',
            15.0, 'weekly',
            '{"days": ["sunday"], "notes": "Maximum therapeutic dose"}',
            CURRENT_DATE, true, 'Jay Campbell - Tirzepatide Advanced'
        );
    END IF;

    -- Jay Campbell Growth Hormone Stack
    IF cjc1295_id IS NOT NULL AND ipamorelin_id IS NOT NULL THEN
        INSERT INTO protocols (
            user_id, peptide_id, name, daily_target, schedule_type, schedule_config,
            start_date, is_template, template_name
        ) VALUES
        (
            NULL, cjc1295_id, 'Jay Campbell - CJC-1295 Stack',
            0.1, 'custom',
            '{"days": ["monday", "tuesday", "wednesday", "thursday", "friday"], "time": "bedtime", "notes": "5 days on, 2 days off"}',
            CURRENT_DATE, true, 'Jay Campbell - CJC-1295 Stack'
        ),
        (
            NULL, ipamorelin_id, 'Jay Campbell - Ipamorelin Stack',
            0.3, 'custom',
            '{"days": ["monday", "tuesday", "wednesday", "thursday", "friday"], "time": "bedtime", "notes": "Stack with CJC-1295"}',
            CURRENT_DATE, true, 'Jay Campbell - Ipamorelin Stack'
        );
    END IF;

    -- Jay Campbell BPC-157 Healing Protocol
    IF bpc157_id IS NOT NULL THEN
        INSERT INTO protocols (
            user_id, peptide_id, name, daily_target, schedule_type, schedule_config,
            start_date, is_template, template_name
        ) VALUES
        (
            NULL, bpc157_id, 'Jay Campbell - BPC-157 Healing (250mcg twice daily)',
            0.5, 'custom',
            '{"times": ["morning", "evening"], "notes": "Twice daily for injury healing, 4-6 week cycles"}',
            CURRENT_DATE, true, 'Jay Campbell - BPC-157 Healing'
        ),
        (
            NULL, bpc157_id, 'Jay Campbell - BPC-157 Maintenance (250mcg daily)',
            0.25, 'daily',
            '{"time": "morning", "notes": "Daily maintenance for gut health"}',
            CURRENT_DATE, true, 'Jay Campbell - BPC-157 Maintenance'
        );
    END IF;

END $$;

-- Create view for easy template access
CREATE OR REPLACE VIEW protocol_templates AS
SELECT
    p.id,
    p.peptide_id,
    p.name,
    p.weekly_target,
    p.daily_target,
    p.schedule_type,
    p.schedule_config,
    p.template_name,
    pt.name as peptide_name,
    pt.category as peptide_category
FROM protocols p
JOIN peptides pt ON p.peptide_id = pt.id
WHERE p.is_template = true
ORDER BY pt.category, pt.name, p.name;