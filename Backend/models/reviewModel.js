import { Schema, model } from "mongoose";

const reviewSchema = new Schema({
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true
  },

  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },

  comment: {
    type: String,
    trim: true
  }

}, { timestamps: true });

export const Review = model("Review", reviewSchema);