CREATE TABLE alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id UUID NOT NULL,
    type VARCHAR NOT NULL,
    severity VARCHAR NOT NULL,
    message VARCHAR NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ NULL,
    FOREIGN KEY (device_id) REFERENCES devices(id)
);