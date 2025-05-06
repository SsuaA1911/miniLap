import jwt from "jsonwebtoken";

export const authUser = (req, res, next) => {
  //log ผ่าน cookies
  const token =
    req.cookies?.accessToken 
  if (!token) {
    return res.json({ success: false, message: "Access denied. No token." });
  }
  // const token = req.headers.authorization?.split(" ")[1]; //ไว้ตั้งค่าสำหรับไม่ผ่านcookies
  // if (!token) {
  //     return res.json({
  //         success: false,
  //         message: "Access denied. No token."
  //     });
  // }

  try {
    const decoded_token = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded token", decoded_token);
    req.user = { user: { _id: decoded_token.userId } };
    next();
  } catch (err) {
    const isExpired = err.name === "TokenExpiredError";
    console.log("log catch");
    res.status(401).json({
      error: true,
      code: isExpired ? "TOKEN_EXPIRED" : "INVALID_TOKEN",
      message: isExpired
        ? "Token has expired please log in again"
        : "Invalid token.",
    });
  }
};
