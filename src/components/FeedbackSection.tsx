import { useState, useEffect } from "react";
import { FeedbackForm } from "./FeedbackForm";
import { FeedbackCard } from "./FeedbackCard";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "./ui/skeleton";

interface Feedback {
  id: string;
  name: string;
  feedback: string;
  rating: number;
  avatar_url: string;
  created_at: string;
}

export const FeedbackSection = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFeedbacks = async () => {
    try {
      const { data, error } = await supabase
        .from("feedbacks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error) {
      console.error("Error loading feedbacks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Customer Feedback</h2>
          <p className="text-xl text-muted-foreground">
            What our customers say about us
          </p>
          <div className="mt-4 text-3xl font-bold text-primary">
            {feedbacks.length}+ Happy Customers
          </div>
        </div>

        <div className="max-w-2xl mx-auto mb-12">
          <FeedbackForm onFeedbackSubmitted={loadFeedbacks} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))
          ) : (
            feedbacks.map((fb) => (
              <FeedbackCard
                key={fb.id}
                name={fb.name}
                feedback={fb.feedback}
                rating={fb.rating}
                avatarUrl={fb.avatar_url}
                createdAt={fb.created_at}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};
