import exp from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { checkUser } from "../middlewares/checkUser.js";
import {
  addOrUpdateReview,
  getRestaurantReviews,
  deleteReview
} from "../controllers/reviewController.js";

const reviewApi = exp.Router();

// Add or update review
reviewApi.post(
  "/restaurants/:id/reviews",
  verifyToken,
  checkUser,
  addOrUpdateReview
);

// Get restaurant reviews
reviewApi.get(
  "/restaurants/:id/reviews",
  getRestaurantReviews
);

// Delete review
reviewApi.delete(
  "/reviews/:reviewId",
  verifyToken,
  checkUser,
  deleteReview
);

export default reviewApi;