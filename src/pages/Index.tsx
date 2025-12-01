import { useState, useEffect } from "react";
import { ProductCard } from "@/components/ProductCard";
import { PaymentModal } from "@/components/PaymentModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import discordLogo from "@/assets/discord-logo.png";
import youtubeLogo from "@/assets/youtube-logo.png";
import instagramLogo from "@/assets/instagram-logo.png";
import spotifyLogo from "@/assets/spotify-logo.png";
import canvaLogo from "@/assets/canva-logo.webp";
import logo from "@/assets/logo.gif";
import { FeedbackSection } from "@/components/FeedbackSection";

const Index = () => {
  const { toast } = useToast();
  const [totalOrders, setTotalOrders] = useState(0);
  const [todayProfits, setTodayProfits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [productStocks, setProductStocks] = useState<Record<string, number>>({});

  const products = [
    "Discord Offline Members",
    "Discord Online Members", 
    "YouTube Premium",
    "Instagram Followers",
    "Spotify Premium (3 Months)",
    "Canva Premium 1 Year"
  ];

  // Load stats and product stocks from database on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load the single stats record (no daily reset)
        const { data: statsData, error: statsError } = await supabase
          .from('daily_stats')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (statsError) throw statsError;

        if (statsData) {
          setTotalOrders(statsData.total_orders);
          setTodayProfits(Number(statsData.total_profits));
        } else {
          // Create initial stats record
          const { error: insertError } = await supabase
            .from('daily_stats')
            .insert({ total_orders: 1012, total_profits: 3500 });
          
          if (!insertError) {
            setTotalOrders(1012);
            setTodayProfits(3500);
          }
        }

        // Load product stocks
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('name, stock');

        if (productsError) throw productsError;

        if (productsData) {
          const stocks: Record<string, number> = {};
          productsData.forEach(p => {
            stocks[p.name] = p.stock;
          });
          setProductStocks(stocks);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const showPurchaseNotification = () => {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      toast({
        title: "Recent Purchase",
        description: `Someone just purchased ${randomProduct}`,
        duration: 3000,
      });
    };

    const interval = setInterval(showPurchaseNotification, 10000);
    return () => clearInterval(interval);
  }, [toast]);

  // Auto-increment orders and profits every 30 seconds and save to database
  useEffect(() => {
    const incrementStats = async () => {
      try {
        // Increment orders by 1-3 randomly
        const orderIncrement = Math.floor(Math.random() * 3) + 1;
        // Increment profits by 30-50 randomly
        const profitIncrement = Math.floor(Math.random() * 21) + 30;
        
        // Get the latest stats record
        const { data: currentStats } = await supabase
          .from('daily_stats')
          .select('id')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!currentStats) return;

        // Update in database
        const { data, error } = await supabase
          .from('daily_stats')
          .update({
            total_orders: totalOrders + orderIncrement,
            total_profits: todayProfits + profitIncrement
          })
          .eq('id', currentStats.id)
          .select()
          .single();

        if (error) throw error;

        // Update local state
        if (data) {
          setTotalOrders(data.total_orders);
          setTodayProfits(Number(data.total_profits));
        }
      } catch (error) {
        console.error('Error incrementing stats:', error);
      }
    };

    const interval = setInterval(incrementStats, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [totalOrders, todayProfits]);
  const [paymentModal, setPaymentModal] = useState({
    open: false,
    productName: "",
    quantity: 0,
    total: 0,
  });

  const handleBuy = (productName: string, quantity: number, total: number) => {
    setPaymentModal({
      open: true,
      productName,
      quantity,
      total,
    });
  };

  const handlePaymentComplete = async (platform: 'discord' | 'whatsapp', orderId: string) => {
    try {
      // Save order to database
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          product_name: paymentModal.productName,
          quantity: paymentModal.quantity,
          total: paymentModal.total,
          order_id: orderId
        });

      if (orderError) throw orderError;

      // Decrease stock in database
      const currentStock = productStocks[paymentModal.productName] || 0;
      const { error: stockError } = await supabase
        .from('products')
        .update({ stock: currentStock - paymentModal.quantity })
        .eq('name', paymentModal.productName);

      if (stockError) throw stockError;

      // Update local stock state
      setProductStocks(prev => ({
        ...prev,
        [paymentModal.productName]: currentStock - paymentModal.quantity
      }));

      // Get the latest stats record
      const { data: currentStats } = await supabase
        .from('daily_stats')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Update stats in database
      const { data, error: statsError } = await supabase
        .from('daily_stats')
        .update({
          total_orders: totalOrders + 1,
          total_profits: todayProfits + paymentModal.total
        })
        .eq('id', currentStats?.id)
        .select()
        .single();

      if (statsError) throw statsError;

      // Update local state
      if (data) {
        setTotalOrders(data.total_orders);
        setTodayProfits(Number(data.total_profits));
      }

      setPaymentModal({ open: false, productName: "", quantity: 0, total: 0 });
      
      if (platform === 'discord') {
        toast({
          title: "Redirecting to Discord",
          description: "Opening ticket area for your order...",
        });

        setTimeout(() => {
          window.open(
            "https://discord.com/channels/1431137964544491533/1431137965211385900",
            "_blank"
          );
        }, 1000);
      } else {
        toast({
          title: "Redirecting to WhatsApp",
          description: "Opening WhatsApp chat...",
        });

        setTimeout(() => {
          const message = encodeURIComponent(
            `Hi! I just placed an order.\n\nOrder ID: ${orderId}\nProduct: ${paymentModal.productName}\nQuantity: ${paymentModal.quantity}\nTotal: ₹${paymentModal.total}\n\nI have completed the payment. Please process my order.`
          );
          window.open(
            `https://wa.me/918089153924?text=${message}`,
            "_blank"
          );
        }, 1000);
      }
    } catch (error) {
      console.error('Error completing payment:', error);
      toast({
        title: "Error",
        description: "Failed to save order. Please contact support.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen gradient-primary relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-sm bg-background/10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/50 glow-purple">
                  <img 
                    src={logo} 
                    alt="Tricky Store Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Tricky Store</h1>
                  <p className="text-xs text-muted-foreground">Trusted Store</p>
                </div>
              </div>
              
              {/* Stats and Theme Toggle */}
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <div className="text-right px-6 py-3 rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-lg border border-primary/30">
                  <p className="text-xs text-primary-foreground/80">Total Orders</p>
                  <p className="text-2xl font-bold text-primary-foreground">{totalOrders}</p>
                </div>
                <div className="text-right px-6 py-3 rounded-lg bg-gradient-to-br from-green-500 to-green-600 shadow-lg border border-green-400/30">
                  <p className="text-xs text-primary-foreground/80">Total Profits</p>
                  <p className="text-2xl font-bold text-primary-foreground">₹{todayProfits}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Premium Digital Services Store
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience premium quality services for Discord, YouTube, Instagram, Spotify, and more. 
              Fast delivery, guaranteed results, and 24/7 support for all your digital needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <ProductCard
              title="Discord Offline Members"
              price={0.12}
              minQuantity={300}
              maxQuantity={productStocks["Discord Offline Members"] || 6000}
              stock={productStocks["Discord Offline Members"] || 6000}
              logo={discordLogo}
              onBuy={(quantity, total) =>
                handleBuy("Discord Offline Members", quantity, total)
              }
            />

            <ProductCard
              title="Discord Online Members"
              price={0.2}
              minQuantity={200}
              maxQuantity={productStocks["Discord Online Members"] || 2000}
              stock={productStocks["Discord Online Members"] || 2000}
              logo={discordLogo}
              onBuy={(quantity, total) =>
                handleBuy("Discord Online Members", quantity, total)
              }
            />

            <ProductCard
              title="YouTube Premium"
              price={20}
              minQuantity={1}
              maxQuantity={productStocks["YouTube Premium"] || 200}
              stock={productStocks["YouTube Premium"] || 200}
              logo={youtubeLogo}
              onBuy={(quantity, total) =>
                handleBuy("YouTube Premium", quantity, total)
              }
            />

            <ProductCard
              title="Instagram Followers"
              price={0.28}
              minQuantity={100}
              maxQuantity={productStocks["Instagram Followers"] || 200000}
              stock={productStocks["Instagram Followers"] || 200000}
              logo={instagramLogo}
              onBuy={(quantity, total) =>
                handleBuy("Instagram Followers", quantity, total)
              }
            />

            <ProductCard
              title="Spotify Premium (3 Months)"
              price={45}
              minQuantity={1}
              maxQuantity={productStocks["Spotify Premium (3 Months)"] || 500}
              stock={productStocks["Spotify Premium (3 Months)"] || 500}
              logo={spotifyLogo}
              onBuy={(quantity, total) =>
                handleBuy("Spotify Premium (3 Months)", quantity, total)
              }
            />

            <ProductCard
              title="Canva Premium 1 Year"
              price={49}
              minQuantity={1}
              maxQuantity={productStocks["Canva Premium 1 Year"] || 150}
              stock={productStocks["Canva Premium 1 Year"] || 150}
              logo={canvaLogo}
              badge="Pre Order Only"
              onBuy={(quantity, total) =>
                handleBuy("Canva Premium 1 Year", quantity, total)
              }
            />
          </div>

          {/* Feedback Section */}
          <FeedbackSection />

          {/* Features */}
          <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-6 gradient-card rounded-lg border border-border/50">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold text-foreground mb-2">Instant Delivery</h3>
              <p className="text-sm text-muted-foreground">
                Get your members delivered immediately after payment
              </p>
            </div>
            <div className="text-center p-6 gradient-card rounded-lg border border-border/50">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="font-semibold text-foreground mb-2">Secure Payment</h3>
              <p className="text-sm text-muted-foreground">
                Safe and secure payment process via QR code
              </p>
            </div>
            <div className="text-center p-6 gradient-card rounded-lg border border-border/50">
              <div className="text-3xl mb-2">💬</div>
              <h3 className="font-semibold text-foreground mb-2">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">
                Get help anytime through our Discord ticket system
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 backdrop-blur-sm bg-background/10 mt-20">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
            <p>© 2024 Tricky Store. All rights reserved.</p>
          </div>
        </footer>
      </div>

      <PaymentModal
        open={paymentModal.open}
        onClose={() =>
          setPaymentModal({ open: false, productName: "", quantity: 0, total: 0 })
        }
        productName={paymentModal.productName}
        quantity={paymentModal.quantity}
        total={paymentModal.total}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
};

export default Index;
