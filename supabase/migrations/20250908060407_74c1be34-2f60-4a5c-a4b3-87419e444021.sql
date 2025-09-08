-- Add status column to jobs table
ALTER TABLE public.jobs ADD COLUMN status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'paused', 'expired'));

-- Add expiry date column
ALTER TABLE public.jobs ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;

-- Create policy for employers to view their own jobs regardless of status
CREATE POLICY "Employers can view their own jobs" 
ON public.jobs 
FOR SELECT 
USING (auth.uid() = employer_id);