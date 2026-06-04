"use client";
import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { registerAction } from "@/server/actions/auth";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerAction, { error: null as string | null });
  return (
    <div className="grid min-h-screen place-items-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader><CardTitle>Create account</CardTitle><CardDescription>Start writing on Blog CMS</CardDescription></CardHeader>
        <CardContent>
          <form action={action} className="space-y-3">
            <div><Label>Name</Label><Input name="name" required /></div>
            <div><Label>Email</Label><Input name="email" type="email" required /></div>
            <div><Label>Password</Label><Input name="password" type="password" minLength={8} required /></div>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <Button type="submit" disabled={pending} className="w-full">{pending ? "Creating…" : "Create account"}</Button>
            <p className="text-center text-sm text-muted-foreground">Have an account? <Link className="underline" href="/login">Sign in</Link></p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
