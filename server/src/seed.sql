-- Insert a test user (password: "password123")
-- The password hash is generated using bcrypt with 10 rounds
INSERT INTO users (user_id, username, password_hash)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'testuser',
  '$2b$10$rKvVPPJz0zHqzQJ7Z7ZQ0OYXJZz8XGZqZQ0OYXJZz8XGZqZQ0OYXJ'
)
ON CONFLICT (user_id) DO NOTHING;

-- Insert some sample subscriptions for testing
INSERT INTO subscriptions (
  user_id,
  subscription_title,
  subscription_category,
  subscription_amount_cents,
  billing_cycle,
  next_renewal_date,
  subscription_status,
  subscription_note
) VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    'Netflix',
    'Entertainment',
    1599,
    'monthly',
    CURRENT_DATE + INTERVAL '15 days',
    'active',
    'Premium plan with 4K streaming'
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'Spotify',
    'Entertainment',
    999,
    'monthly',
    CURRENT_DATE + INTERVAL '20 days',
    'trial',
    'Premium individual plan'
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'Adobe Creative Cloud',
    'Other',
    5499,
    'monthly',
    CURRENT_DATE + INTERVAL '5 days',
    'canceled',
    'All apps subscription'
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'Car Insurance',
    'Transportation',
    15000,
    'quarterly',
    CURRENT_DATE + INTERVAL '25 days',
    'active',
    'Progressive auto insurance'
  )
ON CONFLICT DO NOTHING;
