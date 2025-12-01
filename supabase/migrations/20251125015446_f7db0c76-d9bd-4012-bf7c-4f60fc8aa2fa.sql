-- Create orders table to store all orders
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  order_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_stats table to track daily orders and profits
CREATE TABLE public.daily_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_profits DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date)
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since this is a public store)
CREATE POLICY "Anyone can view orders"
ON public.orders
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert orders"
ON public.orders
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view daily stats"
ON public.daily_stats
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert daily stats"
ON public.daily_stats
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update daily stats"
ON public.daily_stats
FOR UPDATE
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_daily_stats_updated_at
BEFORE UPDATE ON public.daily_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_daily_stats_date ON public.daily_stats(date);