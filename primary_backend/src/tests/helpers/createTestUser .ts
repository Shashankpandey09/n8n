
import prisma from "@shashankpandey/prisma";
import jwt from "jsonwebtoken";

const SECRET = process.env.SECRET_KEY || "test_secret";
console.log('test_secret--->',SECRET)

export async function createTestUser() {
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      password: "hashedpw" 
    },
  });

  const token = jwt.sign({ username: user.email,id:user.id }, SECRET);

  return { user, token };
}
