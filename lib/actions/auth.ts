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

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Redis first
    await redis.set(`otp:${email}`, otp, { EX: 300 });

    // Try to send email with HTML template
    const emailResult = await sendMail({
      to: email,
      subject: "Your Globetrotter Verification Code",
      text: `Your verification code is: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h1 style="color: #3b82f6; text-align: center;">Globetrotter</h1>
          <h2 style="text-align: center;">Your Verification Code</h2>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="font-size: 36px; letter-spacing: 5px; color: #334155;">${otp}</h1>
          </div>
          <p style="text-align: center;">This code will expire in 5 minutes.</p>
          <p style="text-align: center; color: #64748b; margin-top: 40px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    });

    if (!emailResult.success) {
      console.error("Failed to send email:", emailResult.error);
      
      // For development, return the OTP in the response so testing can continue
      if (process.env.NODE_ENV === 'development') {
        return { 
          success: true, 
          message: "Email sending failed, but OTP generated for development: " + otp,
          devOtp: otp  // Only include this in development!
        };
      }
      
      return { success: false, message: "Failed to send verification code. Please try again later." };
    }

    return { success: true, message: "Verification code sent to email" };
  } catch (error) {
    console.error("OTP generation/sending error:", error);
    return { success: false, message: "An error occurred. Please try again later." };
  }
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
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // delete OTP after signup
  await redis.del(`otp:${email}`);

  return { success: true, message: "Signup successful", user };
}



// Sign in user with email and password
export async function signIn(email: string, password: string) {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: 'Invalid email or password' };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { error: 'Invalid email or password' };
    }


    
    // For now, we'll use a simple session token via Redis
    const sessionId = Math.random().toString(36).substring(2, 15);
    await redis.set(`session:${sessionId}`, user.id, { EX: 60 * 60 * 24 * 7 }); // 7 days
    

    
    // Set the session cookie
    // You'll need to use cookies() from 'next/headers' in a real implementation
    
    return { 
      success: true, 
      sessionId, // This would be used to set the cookie on the client side
      user: { id: user.id, name: user.name, email: user.email } 
    };
  } catch (error) {
    console.error('Signin error:', error);
    return { error: 'Failed to sign in' };
  }
}

// Helper to get current user from session
export async function getCurrentUser(sessionId?: string) {
  try {
    // If sessionId is not passed, we can't get the user

    if (!sessionId) {
      return null;
    }
    
    // Get user ID from Redis session
    const userId = await redis.get(`session:${sessionId}`);
    
    if (!userId) {
      return null;
    }
    
    // Get user data from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
    
    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

export async function signOut(sessionId?: string) {
  if (!sessionId) {
    return { success: false, message: 'No session to logout from' };
  }
  
  try {
    // Clear the session from Redis
    await redis.del(`session:${sessionId}`);
    
    // The cookie will be cleared on the client side
    return { success: true, message: 'Successfully signed out' };
  } catch (error) {
    console.error('Signout error:', error);
    return { success: false, message: 'Failed to sign out' };
  }
}

