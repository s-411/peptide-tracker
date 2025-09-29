-- Create protocols table for dose target configuration
CREATE TABLE protocols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    peptide_id UUID REFERENCES peptides(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(200) NOT NULL,
    weekly_target DECIMAL(10,3),
    daily_target DECIMAL(10,3),
    schedule_type VARCHAR(20) NOT NULL CHECK (schedule_type IN ('daily', 'weekly', 'custom', 'every_other_day')),
    schedule_config JSONB NOT NULL DEFAULT '{}',
    start_date DATE NOT NULL,
    end_date DATE,
    is_template BOOLEAN DEFAULT false,
    template_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient protocol querying
CREATE INDEX idx_protocols_user_id ON protocols(user_id);
CREATE INDEX idx_protocols_peptide_id ON protocols(peptide_id);
CREATE INDEX idx_protocols_user_active ON protocols(user_id, is_active);
CREATE INDEX idx_protocols_user_peptide_active ON protocols(user_id, peptide_id, is_active);
CREATE INDEX idx_protocols_templates ON protocols(is_template) WHERE is_template = true;
CREATE INDEX idx_protocols_date_range ON protocols(start_date, end_date);

-- Enable Row Level Security
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for protocols - users can only access their own protocols
CREATE POLICY "Users can manage own protocols" ON protocols FOR ALL
    USING (user_id = (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text));

-- Allow users to view template protocols (where user_id might be null for global templates)
CREATE POLICY "Users can view template protocols" ON protocols FOR SELECT
    USING (is_template = true OR user_id = (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text));

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_protocols_updated_at
    BEFORE UPDATE ON protocols
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add check constraints
ALTER TABLE protocols ADD CONSTRAINT check_weekly_target_positive
    CHECK (weekly_target IS NULL OR weekly_target > 0);

ALTER TABLE protocols ADD CONSTRAINT check_daily_target_positive
    CHECK (daily_target IS NULL OR daily_target > 0);

ALTER TABLE protocols ADD CONSTRAINT check_date_logic
    CHECK (end_date IS NULL OR end_date >= start_date);

ALTER TABLE protocols ADD CONSTRAINT check_start_date_not_past
    CHECK (start_date >= CURRENT_DATE - INTERVAL '7 days'); -- Allow some flexibility for backdating

ALTER TABLE protocols ADD CONSTRAINT check_targets_present
    CHECK (weekly_target IS NOT NULL OR daily_target IS NOT NULL);

-- Prevent overlapping active protocols for same user/peptide combination
CREATE UNIQUE INDEX idx_protocols_no_overlap
ON protocols (user_id, peptide_id)
WHERE is_active = true AND is_template = false;

-- Create function to validate protocol targets against peptide safety ranges
CREATE OR REPLACE FUNCTION validate_protocol_targets()
RETURNS TRIGGER AS $$
BEGIN
    -- Get peptide safety range
    DECLARE
        min_dose DECIMAL;
        max_dose DECIMAL;
        peptide_range JSONB;
    BEGIN
        SELECT typical_dose_range INTO peptide_range
        FROM peptides
        WHERE id = NEW.peptide_id;

        IF peptide_range IS NOT NULL THEN
            min_dose := (peptide_range->>'min')::DECIMAL;
            max_dose := (peptide_range->>'max')::DECIMAL;

            -- Validate weekly target
            IF NEW.weekly_target IS NOT NULL AND (
                NEW.weekly_target < min_dose OR
                NEW.weekly_target > max_dose * 7  -- Allow up to 7x daily max for weekly
            ) THEN
                RAISE EXCEPTION 'Weekly target %.3f is outside safe range for this peptide', NEW.weekly_target;
            END IF;

            -- Validate daily target
            IF NEW.daily_target IS NOT NULL AND (
                NEW.daily_target < min_dose OR
                NEW.daily_target > max_dose
            ) THEN
                RAISE EXCEPTION 'Daily target %.3f is outside safe range for this peptide', NEW.daily_target;
            END IF;
        END IF;

        RETURN NEW;
    END;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for protocol target validation
CREATE TRIGGER validate_protocol_targets_trigger
    BEFORE INSERT OR UPDATE ON protocols
    FOR EACH ROW
    EXECUTE FUNCTION validate_protocol_targets();