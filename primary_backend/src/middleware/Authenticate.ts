import { ExtendedReq } from "../routes/workflow";
import { Response, NextFunction } from "express";
import Jwt, { JwtPayload } from "jsonwebtoken";

type AuthTokenPayload = JwtPayload & {
  id: number;      
  email?: string;
};

async function Authenticate(req: ExtendedReq, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization header or token is missing" });
    }

    const token = auth.split(" ")[1];

    const decoded = Jwt.verify(token, process.env.SECRET_KEY!) as JwtPayload | string;
      
    if (typeof decoded === "string" || !decoded) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const payload = decoded as AuthTokenPayload;


    req.userId = payload.id

    return next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
}

export default Authenticate;
