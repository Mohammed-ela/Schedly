-- Schedly Database Schema
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- Table des profils utilisateurs Schedly
CREATE TABLE IF NOT EXISTS schedly_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des créneaux
CREATE TABLE IF NOT EXISTS schedly_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  title TEXT NOT NULL,
  max_bookings INTEGER DEFAULT 1,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des réservations
CREATE TABLE IF NOT EXISTS schedly_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_id UUID REFERENCES schedly_slots(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slot_id, user_id, status)
);

-- Index
CREATE INDEX IF NOT EXISTS schedly_slots_date_idx ON schedly_slots(date);
CREATE INDEX IF NOT EXISTS schedly_bookings_slot_idx ON schedly_bookings(slot_id);
CREATE INDEX IF NOT EXISTS schedly_bookings_user_idx ON schedly_bookings(user_id);

-- Activer RLS
ALTER TABLE schedly_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedly_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedly_bookings ENABLE ROW LEVEL SECURITY;

-- Policies pour profiles
CREATE POLICY "Users can view own profile" ON schedly_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON schedly_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON schedly_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies pour slots (lecture publique, écriture admin)
CREATE POLICY "Anyone can view slots" ON schedly_slots
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert slots" ON schedly_slots
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM schedly_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete slots" ON schedly_slots
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM schedly_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Policies pour bookings
CREATE POLICY "Users can view own bookings" ON schedly_bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings" ON schedly_bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM schedly_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can insert own bookings" ON schedly_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" ON schedly_bookings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete bookings" ON schedly_bookings
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM schedly_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Pour créer un admin, exécuter après avoir créé un compte :
-- UPDATE schedly_profiles SET role = 'admin' WHERE email = 'votre-email@example.com';
