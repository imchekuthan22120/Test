import { Star } from "lucide-react";
import { Card } from "./ui/card";
import feedbackAvatar from "@/assets/feedback-avatar.gif";

interface FeedbackCardProps {
  name: string;
  feedback: string;
  rating: number;
  avatarUrl: string;
  createdAt: string;
}

export const FeedbackCard = ({ name, feedback, rating, avatarUrl, createdAt }: FeedbackCardProps) => {
  return (
    <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <img
          src={feedbackAvatar}
          alt={name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold">{name}</h4>
            <span className="text-xs text-muted-foreground">
              {new Date(createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex gap-0.5 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{feedback}</p>
        </div>
      </div>
    </Card>
  );
};
