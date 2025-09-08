-- Add admin policies for jobs table
CREATE POLICY "Admins can view all jobs" 
ON public.jobs 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete jobs" 
ON public.jobs 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update jobs" 
ON public.jobs 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));