import mongoose from "mongoose";
import dotenv from "dotenv";
import Restaurant from "./models/restaurantModel.js";
import User from "./models/userModel.js";

dotenv.config();

async function checkDb() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Connected to DB");

    const restaurantId = "6a31a8afb81870b20287889f";
    const restaurant = await Restaurant.findById(restaurantId).populate("owner");
    
    if (!restaurant) {
      console.log(`Restaurant ${restaurantId} not found.`);
    } else {
      console.log("\n=== Restaurant Info ===");
      console.log("Name:", restaurant.name);
      console.log("Owner ID:", restaurant.owner ? restaurant.owner._id : "None");
      console.log("Owner Email:", restaurant.owner ? restaurant.owner.email : "None");
      console.log("Owner Role:", restaurant.owner ? restaurant.owner.role : "None");
    }

    console.log("\n=== All Vendors in DB ===");
    const vendors = await User.find({ role: "vendor" });
    vendors.forEach(v => {
      console.log(`- ID: ${v._id}, Email: ${v.email}, Name: ${v.name}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkDb();
