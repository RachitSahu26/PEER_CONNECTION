import { useMutation } from "@tanstack/react-query";
import { api, type InsertFeedback } from "@shared/routes";

export function useSubmitFeedback() {
  return useMutation({
    mutationFn: async (data: InsertFeedback) => {
      const res = await fetch(api.feedback.submit.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to submit feedback");
      }
    },
  });
}
