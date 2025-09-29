-- Create peptides table
CREATE TABLE peptides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_custom BOOLEAN DEFAULT true,
    category VARCHAR(50) NOT NULL,
    typical_dose_range JSONB NOT NULL,
    safety_notes TEXT[],
    jay_content_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for peptides
CREATE INDEX idx_peptides_user_id ON peptides(user_id);
CREATE INDEX idx_peptides_category ON peptides(category);
CREATE INDEX idx_peptides_is_custom ON peptides(is_custom);

-- Enable Row Level Security
ALTER TABLE peptides ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for peptides - users can access their own peptides and global pre-configured ones
CREATE POLICY "Users can view own peptides and global peptides" ON peptides FOR SELECT
    USING (user_id IS NULL OR user_id = (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text));

CREATE POLICY "Users can manage own peptides" ON peptides FOR ALL
    USING (user_id = (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text));

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_peptides_updated_at
    BEFORE UPDATE ON peptides
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add check constraint for category
ALTER TABLE peptides ADD CONSTRAINT check_peptide_category
    CHECK (category IN ('weight_loss', 'muscle_building', 'recovery', 'longevity', 'cognitive', 'other'));