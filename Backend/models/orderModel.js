import { Schema, model } from "mongoose";

const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      priceAtPurchase: {
        type: Number,
        required: true
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: [
      "pending","accepted","preparing","out-for-delivery","delivered","cancelled"],
    default: "pending"
  },
  deliveryPartner: {
  type: Schema.Types.ObjectId,
  ref: "User",
  default: null
},
paymentStatus: {
  type: String,
  enum: ["pending", "paid", "refunded"],
  default: "pending"
},
isCancelled: {
  type: Boolean,
  default: false
},

cancelledBy: {
  type: String,
  enum: ["user", "vendor", "admin"],
  default: null
},

cancelReason: {
  type: String
},
discountAmount: {
  type: Number,
  default: 0
},

platformCommission: {
  type: Number,
  default: 0
},

vendorEarning: {
  type: Number,
  default: 0
},

codPreference: {
  type: String,
  enum: ["cash", "upi"],
  default: null
},

deliveryAddress: {
  type: String,
  default: ""
},

deliveryOtp: {
  type: String,
  default: null
},

otpVerified: {
  type: Boolean,
  default: false
}
}, { timestamps: true });

export const Order = model("Order", orderSchema);