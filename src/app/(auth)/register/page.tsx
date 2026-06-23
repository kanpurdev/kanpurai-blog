"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAction } from "@/server/actions/auth";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerAction, { error: null as string | null });

  return (
    <div className="grid min-h-screen place-items-center bg-zinc-50/40 dark:bg-zinc-950/20 p-4">
      <div className="w-full max-w-sm border border-border/80 bg-card rounded-xl p-7 shadow-sm space-y-6">
        {/* Header */}
        <div className="space-y-1.5 text-center">
          <Link href="/" className="inline-block font-black tracking-tight text-foreground text-sm uppercase mb-2">
            <span className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-1.5 py-0.5 rounded text-xs font-mono">K</span>
          </Link>
          <h2 className="text-xl font-extrabold text-foreground">Create Account</h2>
          <p className="text-3xs text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
            Start sharing your technical insights
          </p>
        </div>

        {/* Form */}
        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-500">Full Name</Label>
            <Input 
              name="name" 
              required 
              placeholder="Alex Rivers"
              className="rounded-lg text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-500">Email Address</Label>
            <Input 
              name="email" 
              type="email" 
              required 
              placeholder="name@company.com"
              className="rounded-lg text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-500">Password</Label>
            <Input 
              name="password" 
              type="password" 
              minLength={8}
              required 
              placeholder="Minimum 8 characters"
              className="rounded-lg text-xs"
            />
          </div>

          {state.error && (
            <p className="text-3xs font-semibold text-red-500 bg-red-50/50 dark:bg-red-950/10 border border-red-100/50 dark:border-red-900/20 px-2.5 py-1.5 rounded-lg">
              {state.error}
            </p>
          )}

          <Button type="submit" disabled={pending} className="w-full rounded-lg font-bold text-xs shadow-none">
            {pending ? "Creating account..." : "Register Account"}
          </Button>

          <p className="text-center text-xs font-semibold text-zinc-500">
            Already have an account?{" "}
            <Link className="text-foreground hover:underline font-bold" href="/login">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
