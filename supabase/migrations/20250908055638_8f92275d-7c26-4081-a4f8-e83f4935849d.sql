-- Create jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  job_type TEXT NOT NULL CHECK (job_type IN ('permanent', 'temporary')),
  location_description TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  payment TEXT,
  contact_method TEXT NOT NULL,
  employer_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for jobs
CREATE POLICY "Anyone can view active jobs" 
ON public.jobs 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Employers can create jobs" 
ON public.jobs 
FOR INSERT 
WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can update their own jobs" 
ON public.jobs 
FOR UPDATE 
USING (auth.uid() = employer_id);

CREATE POLICY "Employers can delete their own jobs" 
ON public.jobs 
FOR DELETE 
USING (auth.uid() = employer_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();