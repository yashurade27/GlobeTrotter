"use client";

import React from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sendOtp, verifyOtp, signupUser } from "../actions/signup";
import { CheckCircle } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [otp, setOtp] = React.useState("");

  // server actions
  const [otpState, sendOtpAction, otpPending] = useActionState(sendOtp, null);
  const [verifyState, verifyOtpAction, verifyPending] = useActionState(
    verifyOtp,
    null
  );
  const [signupState, signupAction, signupPending] = useActionState(
    signupUser,
    null
  );

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-[400px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center">Signup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Info Fields (Always Visible) */}
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          {/* OTP Field (Visible after OTP is sent) */}
          {otpState?.success && (
            <div>
              <Label>OTP</Label>
              <div className="flex items-center gap-2">
                <Input
                  name="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit OTP"
                  required
                  disabled={verifyState?.success} // freeze after success
                />
                {verifyState?.success && (
                  <CheckCircle className="text-green-600 w-6 h-6" />
                )}
              </div>
            </div>
          )}

          {/* Step 1: Send OTP */}
          {!otpState?.success && (
            <form action={sendOtpAction}>
              <Input type="hidden" name="name" value={name} />
              <Input type="hidden" name="email" value={email} />
              <Input type="hidden" name="password" value={password} />
              <Button type="submit" disabled={otpPending} className="w-full">
                {otpPending ? "Sending..." : "Send OTP"}
              </Button>
              {otpState?.message && (
                <p className="text-sm text-center">{otpState.message}</p>
              )}
            </form>
          )}

          {/* Step 2: Verify OTP */}
          {otpState?.success && !verifyState?.success && (
            <form action={verifyOtpAction} className="space-y-2">
              <Input type="hidden" name="email" value={email} />
              <Input type="hidden" name="otp" value={otp} />
              <Button
                type="submit"
                disabled={verifyPending}
                className="w-full mt-2"
              >
                {verifyPending ? "Verifying..." : "Verify OTP"}
              </Button>
              {verifyState?.message && (
                <p className="text-sm text-center">{verifyState.message}</p>
              )}
            </form>
          )}

          {/* Step 3: Final Signup */}
          {verifyState?.success && (
            <form action={signupAction} className="space-y-3">
              <Input type="hidden" name="name" value={name} />
              <Input type="hidden" name="email" value={email} />
              <Input type="hidden" name="password" value={password} />
              <Input type="hidden" name="otp" value={otp} />
              <Button
                type="submit"
                disabled={signupPending}
                className="w-full bg-green-600"
              >
                {signupPending ? "Signing up..." : "Signup"}
              </Button>
              {signupState?.message && (
                <p className="text-sm text-center">{signupState.message}</p>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
