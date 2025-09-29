-- Create injections table
CREATE TABLE injections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    peptide_id UUID REFERENCES peptides(id) ON DELETE CASCADE,
    dose DECIMAL(10,3) NOT NULL,
    dose_unit VARCHAR(10) NOT NULL,
    injection_site JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    protocol_id UUID, -- Will reference protocols table when created
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for injections
CREATE INDEX idx_injections_user_id ON injections(user_id);
CREATE INDEX idx_injections_peptide_id ON injections(peptide_id);
CREATE INDEX idx_injections_timestamp ON injections(timestamp);
CREATE INDEX idx_injections_user_timestamp ON injections(user_id, timestamp);
CREATE INDEX idx_injections_user_peptide ON injections(user_id, peptide_id);

-- Enable Row Level Security
ALTER TABLE injections ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for injections - users can only access their own injections
CREATE POLICY "Users can manage own injections" ON injections FOR ALL
    USING (user_id = (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text));

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_injections_updated_at
    BEFORE UPDATE ON injections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add check constraints
ALTER TABLE injections ADD CONSTRAINT check_dose_positive
    CHECK (dose > 0);

ALTER TABLE injections ADD CONSTRAINT check_dose_unit
    CHECK (dose_unit IN ('mg', 'mcg', 'iu', 'ml', 'units'));

ALTER TABLE injections ADD CONSTRAINT check_timestamp_not_future
    CHECK (timestamp <= NOW() + INTERVAL '1 hour'); -- Allow small buffer for timezone differences