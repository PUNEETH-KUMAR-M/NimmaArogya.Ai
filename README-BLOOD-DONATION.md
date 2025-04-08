# MediWrap Connect - Blood Donation Feature

This document provides instructions for setting up and using the blood donation feature in MediWrap Connect.

## Database Setup

To enable the blood donation feature, you need to create the necessary tables in your Supabase database.

### 1. Create the Donor Profiles Table

Run the following SQL in your Supabase SQL Editor:

```sql
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
```

### 2. Create the Donation Centers Table (Optional)

If you want to use real donation centers instead of mock data, run this SQL:

```sql
CREATE TABLE IF NOT EXISTS public.donation_centers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  operating_hours TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample data
INSERT INTO public.donation_centers (name, address, city, state, postal_code, phone, email, operating_hours, image_url)
VALUES 
('City General Hospital', '123 Main Street', 'Downtown', 'CA', '90001', '555-123-4567', 'donate@citygeneral.org', 'Mon-Fri: 8AM-6PM, Sat: 9AM-2PM', 'https://images.unsplash.com/photo-1587351021759-3772687a4d9e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80'),
('Community Blood Center', '456 Park Avenue', 'Westside', 'CA', '90002', '555-234-5678', 'info@communityblood.org', 'Mon-Sat: 9AM-5PM', 'https://images.unsplash.com/photo-1579154204601-01588f351e67?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80'),
('University Medical Center', '789 College Blvd', 'Eastside', 'CA', '90003', '555-345-6789', 'blood@umc.edu', 'Mon-Fri: 8:30AM-7PM, Sat-Sun: 10AM-4PM', 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80'),
('Regional Medical Center', '101 Health Way', 'Northside', 'CA', '90004', '555-456-7890', 'donate@regionalmed.org', 'Mon-Fri: 9AM-6PM', 'https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80');
```

## Feature Overview

The blood donation feature includes:

1. **Donor Registration**: Users can register as blood donors by providing their blood type and other information.
2. **Donation Centers**: View nearby donation centers with information about blood types needed.
3. **Blood Requests**: View active requests for blood donations.
4. **"I Can Help" Button**: Allows registered donors to respond to blood requests.

## Implementation Details

The feature is implemented with the following components:

1. **BloodDonation.tsx**: Main page component that displays donation centers and blood requests.
2. **BloodDonationService.ts**: Service class that handles interactions with the Supabase database.
3. **Database Tables**: The donor_profiles table stores information about registered donors.

## TypeScript Integration

The application includes TypeScript definitions for all database tables in:
`src/integrations/supabase/database-types.ts`

If you add new tables or modify existing ones, update this file to maintain type safety.

## Fallback Mechanism

The application includes fallback mechanisms to ensure functionality even if the database tables don't exist:

1. **Mock Data**: If donation centers or blood requests can't be fetched from the database, mock data is used.
2. **localStorage**: If donor profiles can't be saved to the database, they are stored in localStorage.

## Troubleshooting

If you encounter TypeScript errors related to database tables:

1. Make sure the tables exist in your Supabase database.
2. Check that the database types in `src/integrations/supabase/database-types.ts` match your actual database schema.
3. Use the SQL scripts provided in this document to create the necessary tables.
