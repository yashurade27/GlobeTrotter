"use server";

import { createClient } from "redis";
import { PrismaClient } from "@prisma/client";
import { sendMail } from "@/lib/mail";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const redis = createClient({ url: process.env.REDIS_URL });
redis.connect();

// Step 1: Generate + send OTP
export async function sendOtp(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) {
    return { success: false, message: "Email is required" };
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await redis.set(`otp:${email}`, otp, { EX: 300 });

  // send email
  await sendMail({
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}`,
  });

  return { success: true, message: "OTP sent to email" };
}

// Step 2: Verify OTP
export async function verifyOtp(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const otp = formData.get("otp") as string;

  if (!email || !otp) {
    return { success: false, message: "Email and OTP are required" };
  }

  const storedOtp = await redis.get(`otp:${email}`);
  if (storedOtp === otp) {
    return { success: true, message: "OTP verified successfully" };
  }
  return { success: false, message: "Invalid OTP" };
}

// Step 3: Signup only if OTP is valid
export async function signupUser(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const otp = formData.get("otp") as string;

  if (!name || !email || !password || !otp) {
    return { success: false, message: "All fields are required" };
  }

  const storedOtp = await redis.get(`otp:${email}`);
  if (storedOtp !== otp) {
    return { success: false, message: "OTP not verified" };
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // create user in DB
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  // delete OTP after signup
  await redis.del(`otp:${email}`);

  return { success: true, message: "Signup successful", user };
}
