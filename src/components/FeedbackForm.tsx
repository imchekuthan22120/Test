import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import feedbackAvatar from "@/assets/feedback-avatar.gif";

export const FeedbackForm = ({ onFeedbackSubmitted }: { onFeedbackSubmitted: () => void }) => {
  const [name, setName] = useState("");
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !feedback.trim() || rating === 0) {
      toast({
        title: "Please fill all fields",
        description: "Name, feedback, and rating are required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("feedbacks").insert({
        name: name.trim(),
        feedback: feedback.trim(),
        rating,
        avatar_url: feedbackAvatar,
      });

      if (error) throw error;

      toast({
        title: "Thank you for your feedback!",
        description: "Your feedback has been submitted successfully",
      });

      setName("");
      setFeedback("");
      setRating(0);
      onFeedbackSubmitted();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Failed to submit feedback",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-card rounded-lg border">
      <h3 className="text-xl font-semibold">Share Your Feedback</h3>
      
      <div className="space-y-2">
        <Label htmlFor="name">Your Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="feedback">Your Feedback</Label>
        <Textarea
          id="feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Tell us about your experience..."
          maxLength={500}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Rating</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Submitting..." : "Submit Feedback"}
      </Button>
    </form>
  );
};
