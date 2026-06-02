import Restaurant from "../models/restaurantModel.js";

// Create Restaurant
export const registerRestaurant = async (req, res) => {
  try {
    const restaurant = new Restaurant({
      ...req.body,
      owner: req.user.userId
    });

    const savedRestaurant = await restaurant.save();

    res.status(201).json({
      message: "Restaurant registered successfully",
      restaurant: savedRestaurant
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Restaurant
export const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    if (restaurant.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not authorized"
      });
    }

    await Restaurant.findByIdAndDelete(req.params.id);

    res.json({ message: "Restaurant deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Restaurant
export const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    if (restaurant.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updated = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      message: "Restaurant updated successfully",
      restaurant: updated
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};