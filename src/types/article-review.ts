export type PublicReview = {
  id: string;
  username: string;
  rating: number;
  reviewTitle: string;
  reviewText: string;
  avatarStyle: number;
  helpfulCount: number;
  verified: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ReviewSummary = {
  average: number;
  count: number;
  breakdown: Record<1 | 2 | 3 | 4 | 5, number>;
};

export type ReviewSort = "newest" | "top_rated" | "helpful" | "featured";

export type ArticleReviewStatus = "live" | "hidden" | "spam";
