"use client";
import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { loginAction } from "@/server/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, { error: null as string | null });
  return (
    <div className="grid min-h-screen place-items-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader><CardTitle>Sign in</CardTitle><CardDescription>Welcome back to Blog CMS</CardDescription></CardHeader>
        <CardContent>
          <form action={action} className="space-y-3">
            <div><Label>Email</Label><Input name="email" type="email" required /></div>
            <div><Label>Password</Label><Input name="password" type="password" required /></div>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <Button type="submit" disabled={pending} className="w-full">{pending ? "Signing in…" : "Sign in"}</Button>
            <p className="text-center text-sm text-muted-foreground">No account? <Link className="underline" href="/register">Register</Link></p>
            <p className="text-center text-xs text-muted-foreground">Demo: admin@demo.io / contrib@demo.io / user@demo.io — pw Password123!</p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
