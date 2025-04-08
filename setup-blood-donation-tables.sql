-- Create blood donation centers table
CREATE TABLE public.donation_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT,
    postal_code TEXT,
    latitude FLOAT,
    longitude FLOAT,
    phone TEXT,
    email TEXT,
    website TEXT,
    operating_hours TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create blood donation slots table
CREATE TABLE public.donation_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    center_id UUID NOT NULL REFERENCES public.donation_centers(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    slot_time TIME NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 1,
    booked INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create blood needs table to track which blood types are needed at each center
CREATE TABLE public.blood_needs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    center_id UUID NOT NULL REFERENCES public.donation_centers(id) ON DELETE CASCADE,
    blood_type TEXT NOT NULL,
    urgency TEXT NOT NULL DEFAULT 'normal', -- normal, urgent, critical
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create blood donation appointments table
CREATE TABLE public.donation_appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    center_id UUID NOT NULL REFERENCES public.donation_centers(id) ON DELETE CASCADE,
    slot_id UUID NOT NULL REFERENCES public.donation_slots(id) ON DELETE CASCADE,
    blood_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, completed, cancelled
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create blood donation requests table
CREATE TABLE public.blood_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_name TEXT NOT NULL,
    blood_type TEXT NOT NULL,
    hospital TEXT NOT NULL,
    urgency TEXT NOT NULL, -- medium, urgent, critical
    date_needed DATE NOT NULL,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'active', -- active, fulfilled, expired
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create donor profiles table
CREATE TABLE public.donor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blood_type TEXT NOT NULL,
    last_donation_date DATE,
    donation_count INTEGER DEFAULT 0,
    eligible_to_donate BOOLEAN DEFAULT true,
    next_eligible_date DATE,
    medical_conditions TEXT[],
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT unique_donor_profile UNIQUE (user_id)
);

-- Add RLS policies
-- Policy for donation centers (anyone can view)
CREATE POLICY "Anyone can view donation centers" 
ON public.donation_centers FOR SELECT 
USING (true);

-- Policy for donation slots (anyone can view)
CREATE POLICY "Anyone can view donation slots" 
ON public.donation_slots FOR SELECT 
USING (true);

-- Policy for blood needs (anyone can view)
CREATE POLICY "Anyone can view blood needs" 
ON public.blood_needs FOR SELECT 
USING (true);

-- Policy for donation appointments (users can only see their own)
CREATE POLICY "Users can view their own appointments" 
ON public.donation_appointments FOR SELECT 
USING (auth.uid() = user_id);

-- Policy for donation appointments (users can create their own)
CREATE POLICY "Users can create their own appointments" 
ON public.donation_appointments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy for donation appointments (users can update their own)
CREATE POLICY "Users can update their own appointments" 
ON public.donation_appointments FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy for blood requests (anyone can view)
CREATE POLICY "Anyone can view blood requests" 
ON public.blood_requests FOR SELECT 
USING (true);

-- Policy for donor profiles (users can only see their own)
CREATE POLICY "Users can view their own donor profile" 
ON public.donor_profiles FOR SELECT 
USING (auth.uid() = user_id);

-- Policy for donor profiles (users can create their own)
CREATE POLICY "Users can create their own donor profile" 
ON public.donor_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy for donor profiles (users can update their own)
CREATE POLICY "Users can update their own donor profile" 
ON public.donor_profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Insert sample data for donation centers
INSERT INTO public.donation_centers (name, address, city, state, postal_code, phone, email, operating_hours, image_url)
VALUES
    ('City General Hospital', '123 Main Street', 'Downtown', 'CA', '90001', '555-123-4567', 'donate@citygeneral.org', 'Mon-Fri: 8AM-6PM, Sat: 9AM-2PM', 'https://images.unsplash.com/photo-1587351021759-3772687a4d9e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80'),
    ('Community Blood Center', '456 Park Avenue', 'Westside', 'CA', '90002', '555-234-5678', 'info@communityblood.org', 'Mon-Sat: 9AM-5PM', 'https://images.unsplash.com/photo-1579154204601-01588f351e67?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80'),
    ('University Medical Center', '789 College Blvd', 'Eastside', 'CA', '90003', '555-345-6789', 'blood@umc.edu', 'Mon-Fri: 8:30AM-7PM, Sat-Sun: 10AM-4PM', 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80'),
    ('Regional Medical Center', '101 Health Way', 'Northside', 'CA', '90004', '555-456-7890', 'donate@regionalmed.org', 'Mon-Fri: 9AM-6PM', 'https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80');

-- Insert sample blood needs
INSERT INTO public.blood_needs (center_id, blood_type, urgency)
VALUES
    ((SELECT id FROM public.donation_centers WHERE name = 'City General Hospital'), 'A+', 'urgent'),
    ((SELECT id FROM public.donation_centers WHERE name = 'City General Hospital'), 'O+', 'urgent'),
    ((SELECT id FROM public.donation_centers WHERE name = 'City General Hospital'), 'B-', 'normal'),
    ((SELECT id FROM public.donation_centers WHERE name = 'Community Blood Center'), 'AB+', 'normal'),
    ((SELECT id FROM public.donation_centers WHERE name = 'Community Blood Center'), 'O-', 'urgent'),
    ((SELECT id FROM public.donation_centers WHERE name = 'University Medical Center'), 'A-', 'normal'),
    ((SELECT id FROM public.donation_centers WHERE name = 'University Medical Center'), 'B+', 'urgent'),
    ((SELECT id FROM public.donation_centers WHERE name = 'University Medical Center'), 'O+', 'critical'),
    ((SELECT id FROM public.donation_centers WHERE name = 'Regional Medical Center'), 'AB-', 'normal'),
    ((SELECT id FROM public.donation_centers WHERE name = 'Regional Medical Center'), 'O+', 'urgent');

-- Insert sample donation slots for the next 7 days
DO $$
DECLARE
    center_record RECORD;
    current_date DATE := CURRENT_DATE;
    slot_time TIME;
    slot_date DATE;
BEGIN
    FOR center_record IN SELECT id FROM public.donation_centers
    LOOP
        FOR i IN 0..6 LOOP
            slot_date := current_date + i;
            
            -- Morning slots
            slot_time := '09:00:00';
            INSERT INTO public.donation_slots (center_id, slot_date, slot_time, capacity)
            VALUES (center_record.id, slot_date, slot_time, 5);
            
            slot_time := '11:30:00';
            INSERT INTO public.donation_slots (center_id, slot_date, slot_time, capacity)
            VALUES (center_record.id, slot_date, slot_time, 5);
            
            -- Afternoon slots
            slot_time := '14:00:00';
            INSERT INTO public.donation_slots (center_id, slot_date, slot_time, capacity)
            VALUES (center_record.id, slot_date, slot_time, 5);
            
            slot_time := '16:30:00';
            INSERT INTO public.donation_slots (center_id, slot_date, slot_time, capacity)
            VALUES (center_record.id, slot_date, slot_time, 5);
        END LOOP;
    END LOOP;
END $$;

-- Insert sample blood requests
INSERT INTO public.blood_requests (patient_name, blood_type, hospital, urgency, date_needed, reason, status)
VALUES
    ('John D.', 'A+', 'City General Hospital', 'urgent', CURRENT_DATE, 'Surgery', 'active'),
    ('Sarah M.', 'O-', 'University Medical Center', 'critical', CURRENT_DATE, 'Accident', 'active'),
    ('Michael R.', 'B+', 'Community Blood Center', 'medium', CURRENT_DATE + 1, 'Surgery', 'active');
