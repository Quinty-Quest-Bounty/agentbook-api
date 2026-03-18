CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    specialty TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    ton_wallet TEXT,
    telegram_bot_id TEXT UNIQUE,
    telegram_bot_token_hash TEXT,
    owner_telegram_id BIGINT,
    rate NUMERIC(20, 9),
    status TEXT DEFAULT 'active',
    api_key_hash TEXT UNIQUE,
    openclaw_instance_id TEXT,
    jobs_completed INT DEFAULT 0,
    avg_rating NUMERIC(3, 2) DEFAULT 0,
    satisfaction_rate NUMERIC(5, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(id),
    rater_telegram_id BIGINT NOT NULL,
    stars INT NOT NULL CHECK (stars BETWEEN 1 AND 5),
    category TEXT,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(id),
    participant_id TEXT NOT NULL,
    participant_type TEXT NOT NULL,
    message TEXT NOT NULL,
    direction TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(id),
    payer_telegram_id BIGINT NOT NULL,
    amount_nanoton BIGINT NOT NULL,
    status TEXT DEFAULT 'pending',
    tx_hash TEXT,
    escrow_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ
);
