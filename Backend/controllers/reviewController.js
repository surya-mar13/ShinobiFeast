import { Review } from "../models/reviewModel.js";
import Restaurant from "../models/restaurantModel.js";
import { Order } from "../models/orderModel.js";

/*
  Add or Update Review
  Only allow if user has ordered from that restaurant
*/
export const addOrUpdateReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const restaurantId = req.params.id;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5"
      });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found"
      });
    }

    // ✅ Check if user ordered from this restaurant
    const hasOrdered = await Order.findOne({
      user: userId,
      "items.product": { $exists: true }
    }).populate({
      path: "items.product",
      match: { restaurant: restaurantId }
    });

    if (!hasOrdered) {
      return res.status(403).json({
        message: "You can review only after ordering from this restaurant."
      });
    }

    // Check if already reviewed
    let review = await Review.findOne({
      restaurant: restaurantId,
      user: userId
    });

    if (review) {
      review.rating = rating;
      review.comment = comment;
      await review.save();
    } else {
      review = await Review.create({
        restaurant: restaurantId,
        user: userId,
        rating,
        comment
      });
    }

    // 🔥 Recalculate average rating
    const stats = await Review.aggregate([
      { $match: { restaurant: restaurant._id } },
      {
        $group: {
          _id: "$restaurant",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 }
        }
      }
    ]);

    restaurant.rating = stats[0].avgRating;
    restaurant.totalReviews = stats[0].count;
    await restaurant.save();

    res.json({
      message: "Review submitted successfully",
      review
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal server error"
    });
  }
};


/*
  Get Reviews with Pagination
*/
export const getRestaurantReviews = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;

    const reviews = await Review.find({
      restaurant: req.params.id
    })
      .populate("user", "name")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({
      message: "Reviews fetched successfully",
      reviews
    });

  } catch (err) {
    res.status(500).json({
      message: "Internal server error"
    });
  }
};


/*
  Delete Review (User can delete own review)
*/
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.reviewId,
      user: req.user.userId
    });

    if (!review) {
      return res.status(404).json({
        message: "Review not found"
      });
    }

    res.json({
      message: "Review deleted successfully"
    });

  } catch (err) {
    res.status(500).json({
      message: "Internal server error"
    });
  }
};