-- Create news table
CREATE TABLE public.news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT,
  category TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create news_likes table for likes functionality
CREATE TABLE public.news_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id UUID NOT NULL REFERENCES public.news(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(news_id, user_id)
);

-- Create news_comments table for comments functionality
CREATE TABLE public.news_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id UUID NOT NULL REFERENCES public.news(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for news table
CREATE POLICY "Anyone can view news" 
ON public.news 
FOR SELECT 
USING (true);

-- RLS Policies for news_likes table
CREATE POLICY "Anyone can view likes" 
ON public.news_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own likes" 
ON public.news_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" 
ON public.news_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for news_comments table
CREATE POLICY "Anyone can view comments" 
ON public.news_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create comments" 
ON public.news_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.news_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.news_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updating updated_at in news table
CREATE TRIGGER update_news_updated_at
BEFORE UPDATE ON public.news
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updating updated_at in comments table
CREATE TRIGGER update_news_comments_updated_at
BEFORE UPDATE ON public.news_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample news data
INSERT INTO public.news (title, summary, content, category, published_at) VALUES
('افتتاح مشروع تطوير الحديقة المركزية', 'تم افتتاح مشروع تطوير الحديقة المركزية بتكلفة 5 ملايين ريال لتوفير مساحات خضراء أكثر للمواطنين', 'تم افتتاح مشروع تطوير الحديقة المركزية بحضور العديد من المسؤولين والمواطنين. المشروع الذي تم تنفيذه بتكلفة 5 ملايين ريال يهدف إلى توفير مساحات خضراء أكثر وأماكن ترفيهية للعائلات والأطفال.', 'تطوير', '2024-01-15 10:30:00+00'),
('حملة تنظيف الشوارع الرئيسية', 'انطلاق حملة شاملة لتنظيف وتجميل الشوارع الرئيسية بمشاركة المواطنين والجهات المختصة', 'انطلقت اليوم حملة شاملة لتنظيف وتجميل الشوارع الرئيسية في المدينة بمشاركة فاعلة من المواطنين والجهات الحكومية المختصة. الحملة تهدف إلى المحافظة على البيئة ونظافة المدينة.', 'بيئة', '2024-01-14 08:00:00+00'),
('تحديث أنظمة الإضاءة العامة', 'تركيب أنظمة إضاءة LED موفرة للطاقة في جميع أحياء المدينة لتحسين الرؤية والأمان', 'بدأت أعمال تركيب أنظمة الإضاءة الحديثة LED في جميع أحياء المدينة ضمن مشروع تحديث البنية التحتية. هذه الأنظمة ستوفر 60% من استهلاك الطاقة مع تحسين جودة الإضاءة والأمان.', 'بنية تحتية', '2024-01-13 14:15:00+00'),
('برنامج دعم المشاريع الصغيرة', 'إطلاق برنامج جديد لدعم وتمويل المشاريع الصغيرة والمتوسطة لتعزيز الاقتصاد المحلي', 'أعلنت إدارة المدينة عن إطلاق برنامج جديد لدعم المشاريع الصغيرة والمتوسطة بقيمة إجمالية 10 ملايين ريال. البرنامج يهدف إلى تعزيز الاقتصاد المحلي وخلق فرص عمل جديدة للشباب.', 'اقتصاد', '2024-01-12 16:45:00+00');