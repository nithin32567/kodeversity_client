import { Star, Check } from "lucide-react";
import type { Review } from "../types";
import { computeAverageRating } from "./utils";

interface CourseReviewsProps {
  reviews: Review[];
  /** If true, only show the first 2 reviews (preview mode). */
  preview?: boolean;
}

export function CourseReviews({ reviews, preview = false }: CourseReviewsProps) {
  const averageRating = computeAverageRating(reviews);
  const totalReviews = reviews.length;

  const ratingBreakdown = (() => {
    const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const rating = Math.min(5, Math.max(1, Math.round(r.rating)));
      starCounts[rating as 1 | 2 | 3 | 4 | 5]++;
    });
    return [5, 4, 3, 2, 1].map((stars) => {
      const count = starCounts[stars as 1 | 2 | 3 | 4 | 5];
      const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
      return { stars, pct };
    });
  })();

  const displayedReviews = preview ? reviews.slice(0, 2) : reviews;

  return (
    <div className="space-y-6">
      {!preview && <h2 className="font-display text-lg font-semibold">Student Reviews</h2>}
      {preview && <h2 className="font-display text-lg font-semibold">Reviews ({totalReviews})</h2>}

      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl font-bold">{averageRating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">out of 5</span>
          </div>
          <div className="mt-4 space-y-2">
            {ratingBreakdown.map((r) => (
              <div key={r.stars} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-foreground/80">{r.stars}</span>
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/10">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-primary"
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-muted-foreground">{r.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {displayedReviews.length > 0 ? (
            displayedReviews.map((rev) => (
              <div key={rev.id} className="rounded-xl border border-border bg-card/50 p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-[image:var(--gradient-primary)] text-xs font-semibold text-primary-foreground ring-2 ring-border">
                    {rev.isVerified ? "V" : "R"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">Student</div>
                        {rev.isVerified && (
                          <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-emerald-400">
                            <Check className="h-3 w-3" /> Verified Buyer
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-2 flex gap-0.5 text-amber-400">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${i < rev.rating ? "fill-current" : ""}`}
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-foreground/85">{rev.comment}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No student reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
