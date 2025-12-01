import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import paymentQR from "@/assets/payment-qr.jpg";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  productName: string;
  quantity: number;
  total: number;
  onPaymentComplete: (platform: 'discord' | 'whatsapp', orderId: string) => void;
}

export const PaymentModal = ({
  open,
  onClose,
  productName,
  quantity,
  total,
  onPaymentComplete,
}: PaymentModalProps) => {
  const { toast } = useToast();
  const [showOrderInfo, setShowOrderInfo] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [copied, setCopied] = useState(false);

  const generateOrderId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `TRK${timestamp}${random}`;
  };

  const handlePaymentComplete = () => {
    const newOrderId = generateOrderId();
    setOrderId(newOrderId);
    setShowOrderInfo(true);
  };

  const handleCopyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Order ID copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the order ID manually",
        variant: "destructive",
      });
    }
  };

  const handleGoToTicket = (platform: 'discord' | 'whatsapp') => {
    onPaymentComplete(platform, orderId);
    setShowOrderInfo(false);
    setOrderId("");
  };

  const handleClose = () => {
    onClose();
    setShowOrderInfo(false);
    setOrderId("");
    setCopied(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="gradient-card border-2 border-primary/30 max-w-md">
        {!showOrderInfo ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center text-foreground">
                Complete Payment
              </DialogTitle>
              <DialogDescription className="text-center text-muted-foreground">
                Scan the QR code to complete your purchase
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="bg-background/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Product:</span>
                  <span className="font-medium text-foreground">{productName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-medium text-foreground">{quantity} members</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="text-primary">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={paymentQR}
                    alt="Payment QR Code"
                    className="w-64 h-64 object-cover rounded-lg border-2 border-primary/50 glow-purple"
                  />
                </div>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                After completing the payment, click the button below to get your order ID
              </p>

              <Button
                onClick={handlePaymentComplete}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg transition-smooth glow-purple"
              >
                Payment Complete - Get Order ID
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center text-foreground">
                Order Confirmed! 🎉
              </DialogTitle>
              <DialogDescription className="text-center text-muted-foreground">
                Your order has been created successfully
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="bg-background/50 rounded-lg p-4 space-y-4">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">Your Order ID</p>
                  <div className="flex items-center justify-center gap-2">
                    <Badge className="text-lg px-4 py-2 bg-primary/20 text-primary font-bold">
                      {orderId}
                    </Badge>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyOrderId}
                      className="border-primary/50 hover:bg-primary/20"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="border-t border-border pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Product:</span>
                    <span className="font-medium text-foreground">{productName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span className="font-medium text-foreground">{quantity} members</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-muted-foreground">Total Paid:</span>
                    <span className="text-primary">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-destructive">
                      Important: Screenshot Required
                    </p>
                    <p className="text-xs text-muted-foreground">
                      You must send a screenshot of your payment with your Order ID. Choose your preferred contact method below.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-center font-medium text-foreground">
                  Choose Your Contact Method:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleGoToTicket('discord')}
                    className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-4 transition-smooth"
                  >
                    Discord Ticket
                  </Button>
                  <Button
                    onClick={() => handleGoToTicket('whatsapp')}
                    className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white font-semibold py-4 transition-smooth"
                  >
                    WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
