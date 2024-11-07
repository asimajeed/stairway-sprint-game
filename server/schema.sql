CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    display_name VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255), -- Nullable for OAuth users
    oauth_provider VARCHAR(50), -- 'google', 'facebook'
    oauth_provider_id VARCHAR(255), -- unique ID from OAuth provider
    profile_photo_url VARCHAR(255), -- To store photo from OAuth or custom upload (working in progress)
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
