import { Schema, model } from "mongoose";

const deliveryPartnerSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  vehicleType: {
    type: String,
    enum: ["bike", "scooter", "cycle"],
    required: true
  },

  vehicleNumber: {
    type: String,
    required: true
  },

  isAvailable: {
    type: Boolean,
    default: true
  },

  currentLocation: {
    latitude: Number,
    longitude: Number
  }

}, { timestamps: true });

export const DeliveryPartner = model(
  "DeliveryPartner",
  deliveryPartnerSchema
);