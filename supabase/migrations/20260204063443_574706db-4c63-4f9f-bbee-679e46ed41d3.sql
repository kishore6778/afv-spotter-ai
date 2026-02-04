-- Create detection_logs table for historical logging
CREATE TABLE public.detection_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL DEFAULT gen_random_uuid(),
  image_thumbnail TEXT,
  analysis_result TEXT NOT NULL,
  threat_level TEXT NOT NULL DEFAULT 'unknown',
  detected_objects JSONB DEFAULT '[]'::jsonb,
  confidence_score NUMERIC(5,2),
  processing_time_ms INTEGER,
  source_type TEXT NOT NULL DEFAULT 'image',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_detection_logs_created_at ON public.detection_logs(created_at DESC);
CREATE INDEX idx_detection_logs_threat_level ON public.detection_logs(threat_level);
CREATE INDEX idx_detection_logs_session_id ON public.detection_logs(session_id);

-- Enable Row Level Security
ALTER TABLE public.detection_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for public read/write (since this is a demo system without auth)
CREATE POLICY "Allow all operations on detection_logs" 
ON public.detection_logs 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.detection_logs;