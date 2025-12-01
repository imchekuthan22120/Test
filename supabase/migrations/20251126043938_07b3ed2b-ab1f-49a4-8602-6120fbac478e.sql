-- Create products table for stock tracking
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view products" 
ON public.products 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update products" 
ON public.products 
FOR UPDATE 
USING (true);

-- Insert initial products with stock
INSERT INTO public.products (name, stock) VALUES
  ('Discord Offline Members', 6000),
  ('Discord Online Members', 2000),
  ('YouTube Premium', 200),
  ('Instagram Followers', 200000),
  ('Spotify Premium (3 Months)', 500);

-- Add trigger for updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update daily_stats to have total_orders at 876
UPDATE public.daily_stats SET total_orders = 876 WHERE date = CURRENT_DATE;