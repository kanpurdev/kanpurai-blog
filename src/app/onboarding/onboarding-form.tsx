"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { submitOnboardingAction } from "@/server/actions/onboarding";

export function OnboardingForm({ categories, initialName }: { categories: any[], initialName: string }) {
  const [state, action, pending] = useActionState(submitOnboardingAction, { error: null as string | null });

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={action} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input name="name" defaultValue={initialName} disabled />
              <p className="text-xs text-muted-foreground mt-1">Your display name (managed via your sign-in provider).</p>
            </div>
            
            <div>
              <Label>Username</Label>
              <Input name="username" placeholder="johndoe" required minLength={3} maxLength={30} pattern="[a-zA-Z0-9_-]+" title="Only letters, numbers, underscores, and hyphens" />
              <p className="text-xs text-muted-foreground mt-1">Unique handle used for your profile URL.</p>
            </div>

            <div>
              <Label>Short Bio (Optional)</Label>
              <Textarea name="bio" placeholder="Tell us about yourself..." maxLength={280} className="resize-none h-20" />
            </div>

            <div>
              <Label>Areas of Interest</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center space-x-2 border p-2 rounded-md cursor-pointer hover:bg-muted/50">
                    <input type="checkbox" name="interests" value={cat.id} className="rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="text-sm">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input type="checkbox" name="guidelinesAccepted" required className="mt-1 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm">
                  I accept the <a href="/guidelines" target="_blank" className="underline text-primary">Community Content Policy</a>. I understand that my submissions will be reviewed by editors before publication.
                </span>
              </label>
            </div>
          </div>

          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Saving..." : "Complete Setup"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
