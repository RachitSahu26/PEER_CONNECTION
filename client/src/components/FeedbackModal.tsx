import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, AlertTriangle } from "lucide-react";
import { useSubmitFeedback } from "@/hooks/use-feedback";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerId: number; // Assuming we pass partner's ID or session ID somehow
}

export function FeedbackModal({ isOpen, onClose, partnerId }: FeedbackModalProps) {
  const submit = useSubmitFeedback();
  const [comment, setComment] = useState("");
  const [type, setType] = useState<"like" | "dislike" | "report" | null>(null);

  const handleSubmit = async () => {
    if (!type) return;

    try {
      await submit.mutateAsync({
        toUserId: partnerId,
        type,
        comment,
      });
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border/50 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-display text-center">How was your chat?</DialogTitle>
          <DialogDescription className="text-center">
            Your feedback helps us match you better.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 py-6">
          <Button
            variant={type === "like" ? "default" : "outline"}
            className={`h-24 flex flex-col gap-2 ${type === "like" ? "bg-primary text-primary-foreground border-primary" : "hover:border-primary/50"}`}
            onClick={() => setType("like")}
          >
            <ThumbsUp className="w-8 h-8" />
            <span>Good</span>
          </Button>

          <Button
            variant={type === "dislike" ? "default" : "outline"}
            className={`h-24 flex flex-col gap-2 ${type === "dislike" ? "bg-secondary text-white border-white" : "hover:border-white/50"}`}
            onClick={() => setType("dislike")}
          >
            <ThumbsDown className="w-8 h-8" />
            <span>Bad</span>
          </Button>

          <Button
            variant={type === "report" ? "destructive" : "outline"}
            className={`h-24 flex flex-col gap-2 ${type === "report" ? "bg-destructive text-destructive-foreground" : "hover:border-destructive/50 text-destructive"}`}
            onClick={() => setType("report")}
          >
            <AlertTriangle className="w-8 h-8" />
            <span>Report</span>
          </Button>
        </div>

        {type && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
            <Textarea
              placeholder="Any specific comments? (Optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="bg-background border-input"
            />
            <DialogFooter>
              <Button onClick={handleSubmit} disabled={submit.isPending} className="w-full font-bold">
                {submit.isPending ? "Submitting..." : "Submit Feedback"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
