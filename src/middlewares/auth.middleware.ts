import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET, TOKEN_EXPIRE } from "../config/jwt";

import jwtUserPayload from "../utils/jwtUserPayload";
import { decode } from "punycode";

interface AuthRequest extends Request {
  user?: jwtUserPayload;
}

//middleware to authenticate the user access after that we are going to get the username of the user
//from what we have added in the body user (jwtUserPayload)
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "You should login" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: " Invalid token format" });
  }

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "You dont have access" });
    }
    console.log("Decoded token:", decoded);
    req.user = decoded as jwtUserPayload;
    next();
  });
};


//by using this middle ware we are going to check based on the provided paramter in the 
//router file so if we pass Admin only it means that if the user doesn't have the admin role it is not going to work
//and if we pass admin and student it is going to be used by all admins and students.
export const authorizeRoles = (...allowedRoles: string[]) => {
  return(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    const userPayload = req.user;
    if (!userPayload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowedRoles.includes(userPayload.role)) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }

    next();
  };
};
