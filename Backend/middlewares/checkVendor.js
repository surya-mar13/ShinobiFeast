export const checkVendor = (req, res, next) => {
  
  if (!req.user || req.user.role !== "vendor") {
    return res.status(403).json({
      message: "Access denied. Only vendors are allowed."
    });
  }
  next();
};