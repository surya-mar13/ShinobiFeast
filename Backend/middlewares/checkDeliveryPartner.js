export const checkDeliveryPartner = (req, res, next) => {
  if (!req.user || req.user.role !== "deliveryPartner") {
    return res.status(403).json({
      message: "Access denied. Only delivery partners allowed."
    });
  }

  next();
};