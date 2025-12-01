import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  title: string;
  price: number;
  minQuantity: number;
  maxQuantity: number;
  stock: number;
  logo: string;
  badge?: string;
  onBuy: (quantity: number, total: number) => void;
}

export const ProductCard = ({
  title,
  price,
  minQuantity,
  maxQuantity,
  stock,
  logo,
  badge,
  onBuy,
}: ProductCardProps) => {
  const [quantity, setQuantity] = useState(minQuantity);

  const incrementQuantity = () => {
    if (quantity < maxQuantity && quantity < stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > minQuantity) {
      setQuantity(quantity - 1);
    }
  };

  const total = (quantity * price).toFixed(2);

  return (
    <Card className="gradient-card border-2 border-primary/30 p-6 transition-smooth hover:border-primary hover:glow-purple">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={logo} 
              alt={title} 
              className="w-12 h-12 rounded-full glow-purple"
            />
            <div>
              <h3 className="text-xl font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                ₹{price} each
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {badge && (
              <Badge variant="outline" className="bg-amber-500/20 text-amber-500 border-amber-500/50 font-medium text-xs">
                {badge}
              </Badge>
            )}
            <Badge variant="secondary" className="bg-primary/20 text-primary font-medium">
              Stock: {stock}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Min: {minQuantity}</span>
            <span className="text-muted-foreground">Max: {maxQuantity}</span>
          </div>

          <div className="flex items-center justify-center gap-4 py-4">
            <Button
              variant="outline"
              size="icon"
              onClick={decrementQuantity}
              disabled={quantity <= minQuantity}
              className="h-10 w-10 rounded-full border-primary/50 hover:bg-primary/20"
            >
              <Minus className="h-4 w-4" />
            </Button>

            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-primary">{quantity}</span>
              <span className="text-xs text-muted-foreground">quantity</span>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={incrementQuantity}
              disabled={quantity >= maxQuantity || quantity >= stock}
              className="h-10 w-10 rounded-full border-primary/50 hover:bg-primary/20"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Total: </span>
            <span className="text-2xl font-bold text-primary">₹{total}</span>
          </div>
        </div>

        <Button
          onClick={() => onBuy(quantity, parseFloat(total))}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg transition-smooth glow-purple"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Buy Now
        </Button>
      </div>
    </Card>
  );
};
