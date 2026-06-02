import exp from 'express'
import User from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import {authenticate} from '../middlewares/authenticate.js'
import Restaurant from '../models/restaurantModel.js'
import Product from '../models/productModel.js'
import { Types } from "mongoose"
const commonApi=exp.Router()
commonApi.post('/register', async (req, res) => {
    try {
        let { email, role, password } = req.body
        let is_exist = await User.findOne({ email })
        if (is_exist) {
            return res.status(400).json({
                message: "User already exist"
            })
        }
        let user = new User(req.body)
        await user.validate()

        const hash_password = await bcrypt.hash(password, 10)
        user.password = hash_password
        await user.save()
        return res.status(201).json({
            message: "User registered successfully"
        })
    } catch (err) {
        res.status(400).json({
            message: err.message
        })
    }
})
commonApi.post('/login',async(req,res)=>{
    try{
        let {email,password}=req.body
        let {token,userCred}=await authenticate({email,password})
        res.cookie("token",token,{
            httpOnly:true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        })
        let user=userCred.toObject()
        delete user.password
        res.json({
            message:"Login successful",
            user:user
        })
    }catch(err){
        res.status(400).json({
            message:err.message
        })
    }   
})
commonApi.post('/logout',(req,res)=>{
    res.clearCookie("token",{
        httpOnly:true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    })
    res.json({
        message:"Logout successful"
    })
})
commonApi.get('/restaurants', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const category = req.query.category || "";
        const variety = req.query.variety || "";

        const location = req.query.location || "";

        const filter = {};
        if (search) filter.name = { $regex: search, $options: "i" };
        if (category) filter.category = category;
        if (variety) filter.variety = variety;
        if (location) filter.location = { $regex: location, $options: "i" };

        const restaurants = await Restaurant.find(filter)
            .populate("owner", "name email")
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Restaurant.countDocuments(filter);

        res.status(200).json({
            message: "Restaurants fetched successfully",
            count: restaurants.length,
            total,
            restaurants
        });

    } catch (err) {
        res.status(500).json({
            message: "Internal server error"
        });
    }
});
commonApi.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.status(200).json({ message: "Categories fetched successfully", categories: categories.sort() });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});
commonApi.get('/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search || "";
    const category = req.query.category || "";

    const filter = {};
    if (search) filter.name = new RegExp(search, "i");
    if (category) filter.category = new RegExp(`^${category}$`, "i");

    const products = await Product.find(filter)
      .populate('restaurant', 'name location rating totalReviews')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Products fetched successfully",
      count: products.length,
      products
    });

  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});
commonApi.get('/restaurants/:id', async (req, res) => {
  try {
    const restaurantId = req.params.id;

    if (!Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: "Invalid restaurant ID" });
    }

    const restaurant = await Restaurant.findById(restaurantId)
      .populate("owner", "name email");

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.status(200).json({
      message: "Restaurant fetched successfully",
      restaurant
    });

  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Validate a coupon code against restaurants in the cart
commonApi.post('/validate-coupon', async (req, res) => {
  try {
    const { code, restaurantIds, subtotal } = req.body;
    if (!code || !restaurantIds?.length)
      return res.status(400).json({ message: "Missing coupon code or restaurant info." });
    const upperCode = code.trim().toUpperCase();
    const restaurants = await Restaurant.find({ _id: { $in: restaurantIds } });
    for (const r of restaurants) {
      const coupon = r.coupons?.find(c => c.code === upperCode);
      if (coupon) {
        const sub = Number(subtotal) || 0;
        if (coupon.minOrder > 0 && sub < coupon.minOrder)
          return res.status(400).json({ message: `Minimum order ₹${coupon.minOrder} required for this coupon.` });
        const discount = coupon.discountType === "percent"
          ? Math.floor(sub * coupon.discountValue / 100)
          : Math.min(coupon.discountValue, sub);
        return res.json({
          message: "Coupon applied!",
          coupon: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue, minOrder: coupon.minOrder, restaurantName: r.name, discount }
        });
      }
    }
    return res.status(404).json({ message: "Invalid or expired coupon code." });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

commonApi.get('/restaurants/:id/products', async (req, res) => {
  try {
    const restaurantId = req.params.id;

    if (!Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: "Invalid restaurant ID" });
    }

    const products = await Product.find({
      restaurant: restaurantId
    });

    res.status(200).json({
      message: "Products fetched successfully",
      products
    });

  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});
// get user profile
commonApi.get('/profile', async (req, res) => {
  try {

    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "Not authenticated"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decoded.userId).select("-password");

    res.json({
      message: "User profile fetched successfully",
      user
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});

commonApi.put('/update-profile', async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const { address, location } = req.body;
    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { address, location },
      { new: true, select: "-password" }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

commonApi.put('/change-password', async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old and new passwords are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default commonApi