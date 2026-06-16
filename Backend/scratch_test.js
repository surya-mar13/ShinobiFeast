import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

console.log("Key ID:", process.env.RAZORPAY_KEY_ID);
console.log("Key Secret:", process.env.RAZORPAY_KEY_SECRET ? "exists" : "missing");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

async function test() {
  try {
    const res = await razorpay.orders.create({
      amount: 100,
      currency: "INR",
      receipt: "test_receipt"
    });
    console.log("SUCCESS:", res);
  } catch (err) {
    console.error("ERROR:", err);
  }
}

test();
