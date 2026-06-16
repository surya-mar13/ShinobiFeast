import exp from 'express';
import { connect } from 'mongoose';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { razorpayWebhook } from './controllers/paymentController.js';
import cors from "cors";
// Import APIs
import commonApi from './APIs/commonApi.js';
import vendorsApi from './APIs/vendorsApi.js';
import restaurantApi from './APIs/restaurantApi.js';
import productApi from './APIs/productApi.js';
import cartApi from './APIs/cartApi.js';
import orderApi from "./APIs/orderApi.js";
import reviewApi from "./APIs/reviewApi.js";
import deliveryApi from "./APIs/deliveryApi.js";
import paymentApi from "./APIs/paymentApi.js";
import adminApi from "./APIs/adminApi.js";
import uploadApi from "./APIs/uploadApi.js";
import User from "./models/userModel.js";
import { DeliveryPartner } from "./models/deliveryPartnerModel.js";
config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = exp();

app.post(
  "/payment-api/webhook",
  exp.raw({ type: "application/json" }),
  razorpayWebhook
);
app.use(exp.json());
const allowedOrigins = [
  "https://shinobifeast.vercel.app",
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin === process.env.CLIENT_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(cookieParser());

// -------------------- STATIC FILES (uploads) --------------------
app.use("/uploads", exp.static(path.join(__dirname, "uploads")));

// -------------------- ROUTES --------------------
app.use('/common-api', commonApi);
app.use('/vendor-api', vendorsApi);
app.use('/restraunt-api', restaurantApi);
app.use('/product-api', productApi);
app.use('/cart-api', cartApi);
app.use("/order-api", orderApi);
app.use("/payment-api", paymentApi);
app.use("/review-api", reviewApi);
app.use("/delivery-api", deliveryApi);
app.use("/admin-api", adminApi);
app.use("/upload-api", uploadApi);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    message: `${req.originalUrl} not found`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error"
  });
});

// -------------------- DATABASE + SERVER --------------------

const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL;

const migrateDeliveryPartners = async () => {
  try {
    const deliveryUsers = await User.find({ role: "deliveryPartner" });
    for (const user of deliveryUsers) {
      const existing = await DeliveryPartner.findOne({ user: user._id });
      if (!existing) {
        await DeliveryPartner.create({
          user: user._id,
          vehicleType: "bike",
          vehicleNumber: "MIGRATED"
        });
        console.log(`🚚 Created delivery partner profile for user: ${user.email}`);
      }
    }
  } catch (err) {
    console.error("❌ Delivery partner migration failed:", err.message);
  }
};

const connectDB = async () => {
  try {
    await connect(DB_URL);
    console.log("✅ DB connected successfully");

    await migrateDeliveryPartners();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
};

connectDB();
