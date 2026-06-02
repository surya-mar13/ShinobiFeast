export const checkUser = (req, res, next) => {
  if (!req.user || req.user.role !== "user") {
    return res.status(403).json({
      message: "Access denied. Only users are allowed."
    });
  }

  next();
};