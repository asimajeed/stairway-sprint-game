CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- Nullable for OAuth users
    oauth_provider VARCHAR(50), -- e.g., 'google', 'facebook'
    oauth_provider_id VARCHAR(255), -- The unique ID from OAuth provider
    profile_photo_url VARCHAR(255), -- To store photo from OAuth or custom upload
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE leaderboard (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    score INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    sender_id INT REFERENCES users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for leaderboard ranking by score (descending for high-score queries)
CREATE INDEX idx_leaderboard_score ON leaderboard (score DESC);
