-- Insert the specific donation centers from the mock data
INSERT INTO public.donation_centers (
  name, 
  address, 
  city, 
  state, 
  postal_code, 
  phone, 
  email, 
  operating_hours, 
  image_url
) VALUES
(
  'City General Hospital',
  '123 Main Street',
  'Downtown',
  'CA',
  '90001',
  '555-123-4567',
  'donate@citygeneral.org',
  'Mon-Fri: 8AM-6PM, Sat: 9AM-2PM',
  'https://images.unsplash.com/photo-1587351021759-3772687a4d9e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80'
),
(
  'Community Blood Center',
  '456 Park Avenue',
  'Westside',
  'CA',
  '90002',
  '555-234-5678',
  'info@communityblood.org',
  'Mon-Sat: 9AM-5PM',
  'https://images.unsplash.com/photo-1579154204601-01588f351e67?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80'
),
(
  'University Medical Center',
  '789 College Blvd',
  'Eastside',
  'CA',
  '90003',
  '555-345-6789',
  'blood@umc.edu',
  'Mon-Fri: 8:30AM-7PM, Sat-Sun: 10AM-4PM',
  'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80'
),
(
  'Regional Medical Center',
  '101 Health Way',
  'Northside',
  'CA',
  '90004',
  '555-456-7890',
  'donate@regionalmed.org',
  'Mon-Fri: 9AM-6PM',
  'https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80'
);

-- Insert the blood needs for each center
WITH centers AS (
  SELECT id, name FROM public.donation_centers
)
INSERT INTO public.blood_needs (center_id, blood_type, urgency)
SELECT 
  centers.id,
  blood_type,
  CASE 
    WHEN centers.name = 'City General Hospital' AND blood_type IN ('A+', 'O+', 'B-') THEN 'urgent'
    WHEN centers.name = 'University Medical Center' AND blood_type IN ('A-', 'B+', 'O+') THEN 'urgent'
    ELSE 'normal'
  END as urgency
FROM centers
CROSS JOIN (
  SELECT unnest(ARRAY['A+', 'O+', 'B-']) as blood_type WHERE EXISTS (SELECT 1 FROM centers WHERE name = 'City General Hospital')
  UNION ALL
  SELECT unnest(ARRAY['AB+', 'O-']) as blood_type WHERE EXISTS (SELECT 1 FROM centers WHERE name = 'Community Blood Center')
  UNION ALL
  SELECT unnest(ARRAY['A-', 'B+', 'O+']) as blood_type WHERE EXISTS (SELECT 1 FROM centers WHERE name = 'University Medical Center')
  UNION ALL
  SELECT unnest(ARRAY['AB-', 'O+']) as blood_type WHERE EXISTS (SELECT 1 FROM centers WHERE name = 'Regional Medical Center')
) as blood_types
WHERE 
  (centers.name = 'City General Hospital' AND blood_type IN ('A+', 'O+', 'B-'))
  OR (centers.name = 'Community Blood Center' AND blood_type IN ('AB+', 'O-'))
  OR (centers.name = 'University Medical Center' AND blood_type IN ('A-', 'B+', 'O+'))
  OR (centers.name = 'Regional Medical Center' AND blood_type IN ('AB-', 'O+'));

-- Insert donation slots for each center
WITH centers AS (
  SELECT id, name FROM public.donation_centers
)
INSERT INTO public.donation_slots (center_id, slot_date, slot_time, capacity, booked)
SELECT 
  centers.id,
  CURRENT_DATE as slot_date,
  slot_time::TIME,
  5 as capacity,
  floor(random() * 3)::INT as booked
FROM centers
CROSS JOIN (
  SELECT unnest(ARRAY['09:00:00', '11:30:00', '14:00:00']) as slot_time WHERE EXISTS (SELECT 1 FROM centers WHERE name = 'City General Hospital')
  UNION ALL
  SELECT unnest(ARRAY['10:00:00', '13:00:00', '15:30:00']) as slot_time WHERE EXISTS (SELECT 1 FROM centers WHERE name = 'Community Blood Center')
  UNION ALL
  SELECT unnest(ARRAY['08:30:00', '12:00:00', '16:00:00']) as slot_time WHERE EXISTS (SELECT 1 FROM centers WHERE name = 'University Medical Center')
  UNION ALL
  SELECT unnest(ARRAY['09:30:00', '13:30:00', '15:00:00']) as slot_time WHERE EXISTS (SELECT 1 FROM centers WHERE name = 'Regional Medical Center')
) as slots
WHERE 
  (centers.name = 'City General Hospital' AND slot_time::TIME IN ('09:00:00'::TIME, '11:30:00'::TIME, '14:00:00'::TIME))
  OR (centers.name = 'Community Blood Center' AND slot_time::TIME IN ('10:00:00'::TIME, '13:00:00'::TIME, '15:30:00'::TIME))
  OR (centers.name = 'University Medical Center' AND slot_time::TIME IN ('08:30:00'::TIME, '12:00:00'::TIME, '16:00:00'::TIME))
  OR (centers.name = 'Regional Medical Center' AND slot_time::TIME IN ('09:30:00'::TIME, '13:30:00'::TIME, '15:00:00'::TIME));
