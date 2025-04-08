-- Create the donor_profiles table
CREATE TABLE IF NOT EXISTS public.donor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  blood_type TEXT NOT NULL,
  last_donation_date TIMESTAMP,
  donation_count INTEGER DEFAULT 0,
  eligible_to_donate BOOLEAN DEFAULT TRUE,
  next_eligible_date TIMESTAMP,
  medical_conditions TEXT[],
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.donor_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own donor profile"
  ON public.donor_profiles
  FOR SELECT
  USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own donor profile"
  ON public.donor_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own donor profile"
  ON public.donor_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Sample data (optional)
INSERT INTO public.donor_profiles (user_id, blood_type, donation_count, eligible_to_donate, notifications_enabled)
SELECT 
  auth.uid(), 
  'O+', 
  2, 
  TRUE, 
  TRUE
FROM auth.users
WHERE email = 'admin@example.com' -- Change this to your email
ON CONFLICT (id) DO NOTHING;
