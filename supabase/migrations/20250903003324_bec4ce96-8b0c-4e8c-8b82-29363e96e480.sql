-- Create table for storing embeddings
CREATE TABLE public.embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'news', 'police_station', 'department', 'emergency_contact'
  content_id UUID NOT NULL,
  embedding vector(384), -- Using text-embedding-3-small dimensions
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.embeddings ENABLE ROW LEVEL SECURITY;

-- Create policies for embeddings
CREATE POLICY "Anyone can view embeddings for search" 
ON public.embeddings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage embeddings" 
ON public.embeddings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create index for vector similarity search
CREATE INDEX ON public.embeddings USING ivfflat (embedding vector_cosine_ops);

-- Create index for content lookup
CREATE INDEX idx_embeddings_content_type_id ON public.embeddings(content_type, content_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_embeddings_updated_at
BEFORE UPDATE ON public.embeddings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();