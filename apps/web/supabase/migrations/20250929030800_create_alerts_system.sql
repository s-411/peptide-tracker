-- Create alerts table for dose alerts and recommendations
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'success')),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    action_text VARCHAR(100),
    action_url VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    is_dismissed BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for alerts
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_user_unread ON alerts(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_alerts_user_active ON alerts(user_id, is_dismissed) WHERE is_dismissed = false;
CREATE INDEX idx_alerts_type ON alerts(alert_type);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_expires_at ON alerts(expires_at) WHERE expires_at IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for alerts - users can only access their own alerts
CREATE POLICY "Users can manage own alerts" ON alerts FOR ALL
    USING (user_id = (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text));

-- Add check constraints
ALTER TABLE alerts ADD CONSTRAINT check_alert_type
    CHECK (alert_type IN (
        'dose_limit_warning',
        'dose_limit_exceeded',
        'missed_dose',
        'site_rotation_reminder',
        'protocol_milestone',
        'protocol_complete',
        'week_summary'
    ));

-- Update users table to include notification preferences
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
    "doseLimit": {
        "enabled": true,
        "threshold": 90,
        "deliveryMethods": ["in_app"]
    },
    "missedDose": {
        "enabled": true,
        "gracePeriodHours": 6,
        "deliveryMethods": ["in_app"]
    },
    "siteRotation": {
        "enabled": true,
        "maxConsecutiveUses": 3,
        "deliveryMethods": ["in_app"]
    },
    "protocolMilestones": {
        "enabled": true,
        "milestones": [25, 50, 75, 100],
        "deliveryMethods": ["in_app"]
    },
    "quietHours": {
        "enabled": false,
        "startTime": "22:00",
        "endTime": "08:00"
    },
    "emailNotifications": false,
    "pushNotifications": false
}';

-- Create function to clean up expired alerts
CREATE OR REPLACE FUNCTION cleanup_expired_alerts()
RETURNS void AS $$
BEGIN
    DELETE FROM alerts
    WHERE expires_at < NOW()
    AND is_dismissed = true;
END;
$$ LANGUAGE plpgsql;

-- Create function to get injection site usage analytics
CREATE OR REPLACE FUNCTION get_injection_site_usage(
    p_user_id UUID,
    p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
    location VARCHAR,
    side VARCHAR,
    last_used TIMESTAMP WITH TIME ZONE,
    consecutive_uses INTEGER,
    total_uses INTEGER,
    days_since_last_use INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH recent_injections AS (
        SELECT
            (injection_site->>'location')::VARCHAR as site_location,
            (injection_site->>'side')::VARCHAR as site_side,
            timestamp,
            ROW_NUMBER() OVER (
                PARTITION BY injection_site->>'location', injection_site->>'side'
                ORDER BY timestamp DESC
            ) as rn
        FROM injections
        WHERE user_id = p_user_id
        AND timestamp >= NOW() - INTERVAL '1 day' * p_days_back
        ORDER BY timestamp DESC
    ),
    site_stats AS (
        SELECT
            site_location,
            site_side,
            MAX(timestamp) as last_injection,
            COUNT(*) as usage_count,
            EXTRACT(DAYS FROM NOW() - MAX(timestamp))::INTEGER as days_since
        FROM recent_injections
        GROUP BY site_location, site_side
    ),
    consecutive_usage AS (
        SELECT
            site_location,
            site_side,
            COUNT(*) as consecutive_count
        FROM (
            SELECT
                (injection_site->>'location')::VARCHAR as site_location,
                (injection_site->>'side')::VARCHAR as site_side,
                timestamp,
                ROW_NUMBER() OVER (ORDER BY timestamp DESC) -
                ROW_NUMBER() OVER (
                    PARTITION BY injection_site->>'location', injection_site->>'side'
                    ORDER BY timestamp DESC
                ) as grp
            FROM injections
            WHERE user_id = p_user_id
            ORDER BY timestamp DESC
            LIMIT 10
        ) grouped
        WHERE grp = 0
        GROUP BY site_location, site_side, grp
    )
    SELECT
        s.site_location,
        s.site_side,
        s.last_injection,
        COALESCE(c.consecutive_count, 0)::INTEGER,
        s.usage_count::INTEGER,
        s.days_since
    FROM site_stats s
    LEFT JOIN consecutive_usage c ON
        s.site_location = c.site_location AND
        s.site_side = c.site_side
    ORDER BY s.last_injection DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;