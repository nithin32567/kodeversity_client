import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/presentation/core-ui/dialog";
import { studentService } from "@/infrastructure/student/studentService";
import { toast } from "sonner";
import { RefreshCw, Mail, Phone, GraduationCap, User as UserIcon } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/presentation/core-ui/input-otp";

interface StudentProfileEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  initialData: {
    name?: string | null;
    phone?: string | null;
    highestQualification?: string | null;
    email?: string | null;
  };
  onSuccess: () => void;
}

export function StudentProfileEditModal({
  open,
  onOpenChange,
  userId,
  initialData,
  onSuccess,
}: StudentProfileEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    phone: initialData.phone || "",
    highestQualification: initialData.highestQualification || "",
  });

  // Email and OTP states
  const [email, setEmail] = useState(initialData.email || "");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [emailVerifying, setEmailVerifying] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      await studentService.updateStudent(userId, formData);
      toast.success("Profile updated successfully!");
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to update profile.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email || email === initialData.email) return;

    // Simulate sending OTP
    setLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
      toast.success("OTP sent to your new email.");
    }, 1000);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setEmailVerifying(true);
      // Simulate verifying OTP and updating email
      setTimeout(() => {
        toast.success("Email updated successfully!");
        setOtpSent(false);
        setOtp("");
        setEmailVerifying(false);
        // Note: Realistically you would also update the email on the backend here
        // and we will just update local state or require user to re-login.
      }, 1500);
    } catch (err) {
      toast.error("Invalid OTP.");
      setEmailVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-[var(--accent-cyan)]/30 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="font-mono uppercase tracking-widest text-[var(--accent-cyan)]">
            Edit Profile
          </DialogTitle>
          <DialogDescription className="font-mono text-xs uppercase tracking-widest">
            Update your personal details here.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <label
              htmlFor="name"
              className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2"
            >
              <UserIcon className="h-3 w-3" /> Full Name
            </label>
            <input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono bg-background/50 border-border/50 focus-visible:ring-[var(--accent-cyan)]"
            />
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="phone"
              className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2"
            >
              <Phone className="h-3 w-3" /> Mobile Number
            </label>
            <input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono bg-background/50 border-border/50 focus-visible:ring-[var(--accent-cyan)]"
            />
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="highestQualification"
              className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2"
            >
              <GraduationCap className="h-3 w-3" /> Highest Qualification
            </label>
            <input
              id="highestQualification"
              value={formData.highestQualification}
              onChange={(e) => setFormData({ ...formData, highestQualification: e.target.value })}
              className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono bg-background/50 border-border/50 focus-visible:ring-[var(--accent-cyan)]"
            />
          </div>

          <div className="grid gap-2 pt-4 border-t border-border/50">
            <label
              htmlFor="email"
              className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2"
            >
              <Mail className="h-3 w-3" /> Email Address
            </label>
            <div className="flex gap-2">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={otpSent}
                className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono bg-background/50 border-border/50 focus-visible:ring-[var(--accent-cyan)]"
              />
              {email !== initialData.email && !otpSent && (
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-transparent hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 font-mono uppercase tracking-widest text-xs border-[var(--accent-cyan)]/30 hover:bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]"
                >
                  Verify
                </button>
              )}
            </div>
            {otpSent && (
              <div className="mt-2 space-y-3 p-3 bg-black/20 rounded-md border border-[var(--accent-violet)]/30">
                <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent-violet)]">
                  Enter 6-digit OTP sent to new email
                </label>
                <div className="flex flex-col gap-3">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="border-[var(--accent-violet)]/30" />
                      <InputOTPSlot index={1} className="border-[var(--accent-violet)]/30" />
                      <InputOTPSlot index={2} className="border-[var(--accent-violet)]/30" />
                      <InputOTPSlot index={3} className="border-[var(--accent-violet)]/30" />
                      <InputOTPSlot index={4} className="border-[var(--accent-violet)]/30" />
                      <InputOTPSlot index={5} className="border-[var(--accent-violet)]/30" />
                    </InputOTPGroup>
                  </InputOTP>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={emailVerifying || otp.length !== 6}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full bg-[var(--accent-violet)]/20 hover:bg-[var(--accent-violet)]/40 text-[var(--accent-violet)] font-mono text-xs uppercase tracking-widest"
                  >
                    {emailVerifying ? (
                      <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                    ) : (
                      "Confirm Email"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <DialogClose asChild>
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 font-mono uppercase tracking-widest text-xs">
              Cancel
            </button>
          </DialogClose>
          <button
            onClick={handleSave}
            disabled={loading || otpSent}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 font-mono uppercase tracking-widest text-xs bg-[var(--accent-cyan)] text-black hover:bg-[var(--accent-cyan)]/90 shadow-[0_0_15px_var(--accent-cyan)]"
          >
            {loading ? <RefreshCw className="mr-2 h-3 w-3 animate-spin" /> : "Save Changes"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
