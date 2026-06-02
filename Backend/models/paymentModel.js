import { Schema, model } from "mongoose";

const paymentSchema = new Schema({
  order: {
    type: Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },

  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  method: {
    type: String,
    enum: ["COD", "UPI", "CARD"],
    required: true
  },
  status: {
  type: String,
  enum: ["pending", "success", "failed", "refunded"],
  default: "pending"
},
  transactionId: {
    type: String
  },
  cardDetails: {
    cardHolderName: String,
    last4Digits: String,
    expiryMonth: String,
    expiryYear: String
  }
}, { timestamps: true });

export const Payment = model("Payment", paymentSchema);