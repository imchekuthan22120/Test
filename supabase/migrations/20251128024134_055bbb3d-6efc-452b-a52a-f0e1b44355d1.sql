-- Create feedbacks table
CREATE TABLE public.feedbacks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  feedback TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Create policies for public viewing and inserting
CREATE POLICY "Anyone can view feedbacks" 
ON public.feedbacks 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert feedbacks" 
ON public.feedbacks 
FOR INSERT 
WITH CHECK (true);