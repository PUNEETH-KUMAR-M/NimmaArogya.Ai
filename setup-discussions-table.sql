-- Create discussions table
CREATE TABLE IF NOT EXISTS public.discussions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES auth.users(id) NOT NULL,
    author_name TEXT NOT NULL,
    author_type TEXT NOT NULL,
    avatar_url TEXT,
    topic TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing discussions (anyone can view)
CREATE POLICY "Anyone can view discussions" 
ON public.discussions 
FOR SELECT USING (true);

-- Create policy for inserting discussions (authenticated users only)
CREATE POLICY "Authenticated users can create discussions" 
ON public.discussions 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create policy for updating discussions (only the author can update)
CREATE POLICY "Users can update their own discussions" 
ON public.discussions 
FOR UPDATE 
USING (auth.uid() = author_id);

-- Create policy for deleting discussions (only the author can delete)
CREATE POLICY "Users can delete their own discussions" 
ON public.discussions 
FOR DELETE 
USING (auth.uid() = author_id);

-- Insert sample discussions data
-- First, check if we have users in the profiles table
DO $$
DECLARE
    user_id1 UUID;
    user_id2 UUID;
    user_id3 UUID;
    user_id4 UUID;
BEGIN
    -- Try to get user IDs from profiles table
    SELECT id INTO user_id1 FROM auth.users WHERE id IN (SELECT id FROM public.profiles) LIMIT 1;
    SELECT id INTO user_id2 FROM auth.users WHERE id IN (SELECT id FROM public.profiles) LIMIT 1 OFFSET 1;
    SELECT id INTO user_id3 FROM auth.users WHERE id IN (SELECT id FROM public.profiles) LIMIT 1 OFFSET 2;
    SELECT id INTO user_id4 FROM auth.users WHERE id IN (SELECT id FROM public.profiles) LIMIT 1 OFFSET 3;
    
    -- If we don't have enough users, use the same user ID for all
    IF user_id2 IS NULL THEN user_id2 := user_id1; END IF;
    IF user_id3 IS NULL THEN user_id3 := user_id1; END IF;
    IF user_id4 IS NULL THEN user_id4 := user_id1; END IF;
    
    -- If we don't have any users at all, don't insert sample data
    IF user_id1 IS NOT NULL THEN
        INSERT INTO public.discussions (author_id, author_name, author_type, avatar_url, topic, title, content, created_at, likes, comments, verified)
        VALUES
            (user_id1, 'Dr. Sarah Johnson', 'Verified Doctor', 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80', 'Heart Health', 'Understanding Heart Palpitations: When to Worry', 'Many people experience heart palpitations, which can feel like the heart is pounding, fluttering, or skipping a beat. Most of the time, heart palpitations are harmless and are caused by stress, anxiety, caffeine, or exercise. However, in some cases, they can be a sign of a more serious heart condition...', NOW() - INTERVAL '2 days', 45, 12, true),
            
            (user_id2, 'Emily Rodriguez', 'Patient', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80', 'Mental Health', 'Coping Strategies for Anxiety During Pandemic', 'I''ve been struggling with anxiety since the pandemic began, and I wanted to share some strategies that have helped me. Firstly, establishing a routine has been crucial. I wake up at the same time every day, have set work hours, and make time for exercise and relaxation...', NOW() - INTERVAL '5 days', 78, 23, false),
            
            (user_id3, 'Dr. Michael Chen', 'Verified Doctor', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80', 'Sleep Health', 'Improving Your Sleep Quality: Evidence-Based Tips', 'As a neurologist specializing in sleep disorders, I often encounter patients struggling with poor sleep quality. Here are some evidence-based strategies to improve your sleep: Maintain a consistent sleep schedule, create a restful environment, avoid screens before bedtime...', NOW() - INTERVAL '1 week', 112, 34, true),
            
            (user_id4, 'Robert Miller', 'Patient', 'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80', 'Chronic Pain', 'Living with Chronic Back Pain: My Journey', 'I''ve been dealing with chronic back pain for over 10 years now, and I wanted to share my journey and what has helped me. After trying numerous treatments, from physical therapy to medication, I''ve found that a combination approach works best for me...', NOW() - INTERVAL '2 weeks', 67, 29, false);
    END IF;
END $$;

-- Create comments table for discussion comments
CREATE TABLE IF NOT EXISTS public.discussion_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discussion_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES auth.users(id) NOT NULL,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.discussion_comments ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing comments (anyone can view)
CREATE POLICY "Anyone can view discussion comments" 
ON public.discussion_comments 
FOR SELECT USING (true);

-- Create policy for inserting comments (authenticated users only)
CREATE POLICY "Authenticated users can create comments" 
ON public.discussion_comments 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create policy for updating comments (only the author can update)
CREATE POLICY "Users can update their own comments" 
ON public.discussion_comments 
FOR UPDATE 
USING (auth.uid() = author_id);

-- Create policy for deleting comments (only the author can delete)
CREATE POLICY "Users can delete their own comments" 
ON public.discussion_comments 
FOR DELETE 
USING (auth.uid() = author_id);

-- Create health_topics table
CREATE TABLE IF NOT EXISTS public.health_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL
);

-- Enable RLS
ALTER TABLE public.health_topics ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing health topics (anyone can view)
CREATE POLICY "Anyone can view health topics" 
ON public.health_topics 
FOR SELECT USING (true);

-- Insert health topics
INSERT INTO public.health_topics (name)
VALUES
    ('Mental Health'),
    ('Heart Health'),
    ('Diabetes'),
    ('Nutrition'),
    ('Fitness'),
    ('Sleep'),
    ('Women''s Health'),
    ('Men''s Health'),
    ('Pediatrics'),
    ('Chronic Pain'),
    ('Cancer'),
    ('Allergies'),
    ('Weight Management'),
    ('Pregnancy'),
    ('Senior Health');
