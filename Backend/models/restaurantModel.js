import { Schema, model, Types } from "mongoose";

const restaurantSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },

    location: {
        type: String,
        required: true
    },
    owner: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },

   category: {
   type: [String],
   enum: ["veg", "non-veg"],
   required: true
},
    variety: [{
        type: String,
        enum: [
          "north-indian", "south-indian", "chinese", "italian",
          "american", "japanese", "mexican", "fast-food",
          "desserts", "seafood", "street-food", "cafe",
          "bbq", "vegan", "pan-asian", "multi-cuisine"
        ],
        required: true
    }],

    coupons: [{
        code:          { type: String, required: true, uppercase: true, trim: true },
        discountType:  { type: String, enum: ["percent", "flat"], required: true },
        discountValue: { type: Number, required: true },
        minOrder:      { type: Number, default: 0 }
    }],

    image: {
        type: String
    },

        offer: {
            type: String,
            default: ""
        },

        isOpen: {
            type: Boolean,
            default: true
        },

    rating: {
        type: Number,
        default: 0
    },

    totalReviews: {
        type: Number,
        default: 0
    }

}, { timestamps: true });

const Restaurant = model("Restaurant", restaurantSchema);
export default Restaurant;