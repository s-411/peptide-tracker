-- Create protocols table for dosing schedules
CREATE TABLE protocols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    peptide_id UUID REFERENCES peptides(id) ON DELETE CASCADE,
    schedule JSONB NOT NULL, -- Contains dosing schedule information
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wellness_metrics table for future expansion
CREATE TABLE wellness_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL,
    value DECIMAL(10,3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    injection_id UUID REFERENCES injections(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create peptide_templates table for pre-configured peptides
CREATE TABLE peptide_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    typical_dose_range JSONB NOT NULL,
    safety_notes TEXT[],
    jay_content_id VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for protocols
CREATE INDEX idx_protocols_user_id ON protocols(user_id);
CREATE INDEX idx_protocols_peptide_id ON protocols(peptide_id);
CREATE INDEX idx_protocols_is_active ON protocols(is_active);

-- Create indexes for wellness_metrics
CREATE INDEX idx_wellness_metrics_user_id ON wellness_metrics(user_id);
CREATE INDEX idx_wellness_metrics_type ON wellness_metrics(metric_type);
CREATE INDEX idx_wellness_metrics_timestamp ON wellness_metrics(timestamp);
CREATE INDEX idx_wellness_metrics_injection_id ON wellness_metrics(injection_id);

-- Create indexes for peptide_templates
CREATE INDEX idx_peptide_templates_category ON peptide_templates(category);
CREATE INDEX idx_peptide_templates_is_active ON peptide_templates(is_active);

-- Enable Row Level Security
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE peptide_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for protocols
CREATE POLICY "Users can manage own protocols" ON protocols FOR ALL
    USING (user_id = (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text));

-- Create RLS policies for wellness_metrics
CREATE POLICY "Users can manage own wellness metrics" ON wellness_metrics FOR ALL
    USING (user_id = (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text));

-- Create RLS policies for peptide_templates (read-only for all users)
CREATE POLICY "All users can view active peptide templates" ON peptide_templates FOR SELECT
    USING (is_active = true);

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_protocols_updated_at
    BEFORE UPDATE ON protocols
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wellness_metrics_updated_at
    BEFORE UPDATE ON wellness_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_peptide_templates_updated_at
    BEFORE UPDATE ON peptide_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add check constraints
ALTER TABLE wellness_metrics ADD CONSTRAINT check_metric_type
    CHECK (metric_type IN ('weight', 'body_fat', 'muscle_mass', 'energy_level', 'sleep_quality', 'mood', 'other'));

ALTER TABLE peptide_templates ADD CONSTRAINT check_template_category
    CHECK (category IN ('weight_loss', 'muscle_building', 'recovery', 'longevity', 'cognitive', 'other'));

-- Add foreign key constraint to injections table for protocol_id
ALTER TABLE injections ADD CONSTRAINT fk_injections_protocol_id
    FOREIGN KEY (protocol_id) REFERENCES protocols(id) ON DELETE SET NULL;