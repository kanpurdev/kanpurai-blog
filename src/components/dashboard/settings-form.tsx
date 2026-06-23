"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { updateSettingsAction } from "@/server/actions/settings";
import { SiteSettings } from "@/lib/settings";
import { 
  Globe, 
  MessageSquare, 
  ShieldAlert, 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw, 
  Eye, 
  Terminal 
} from "lucide-react";

export function SettingsForm({ initialSettings }: { initialSettings: SiteSettings }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings(prev => ({ ...prev, [name]: checked }));
    } else if (name === "sessionTimeout") {
      setSettings(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (name: keyof SiteSettings, checked: boolean) => {
    setSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handleGenerateApiKey = () => {
    const randomHex = Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    setSettings(prev => ({ ...prev, apiKey: `ka_live_${randomHex}` }));
    toast.success("New API key generated! Save changes to apply.");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await updateSettingsAction(settings);
        if (res.success) {
          toast.success("Settings saved successfully!");
          router.refresh();
        } else {
          toast.error("Failed to save settings");
        }
      } catch (err: any) {
        toast.error(err.message || "An error occurred");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Tabs Sidebar */}
          <div className="w-full md:w-56 shrink-0">
            <div className="border border-border/60 bg-zinc-50/50 dark:bg-zinc-900/10 rounded-lg p-1.5 space-y-1">
              <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 gap-1 items-stretch">
                <TabsTrigger 
                  value="general" 
                  className="flex items-center gap-2.5 justify-start px-3 py-2 rounded-md transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-foreground data-[state=active]:shadow-sm text-left text-zinc-500 text-xs font-semibold hover:text-foreground"
                >
                  <SettingsIcon className="h-4 w-4" />
                  <span>General Info</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="seo" 
                  className="flex items-center gap-2.5 justify-start px-3 py-2 rounded-md transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-foreground data-[state=active]:shadow-sm text-left text-zinc-500 text-xs font-semibold hover:text-foreground"
                >
                  <Globe className="h-4 w-4" />
                  <span>SEO & Analytics</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="comments" 
                  className="flex items-center gap-2.5 justify-start px-3 py-2 rounded-md transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-foreground data-[state=active]:shadow-sm text-left text-zinc-500 text-xs font-semibold hover:text-foreground"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Comment Mod</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="security" 
                  className="flex items-center gap-2.5 justify-start px-3 py-2 rounded-md transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-foreground data-[state=active]:shadow-sm text-left text-zinc-500 text-xs font-semibold hover:text-foreground"
                >
                  <ShieldAlert className="h-4 w-4" />
                  <span>Security & API</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Tabs Content Details */}
          <div className="flex-1">
            {/* General Tab */}
            <TabsContent value="general" className="mt-0 outline-none">
              <div className="border border-border/80 bg-card rounded-lg p-6 space-y-6 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-foreground">General Platform configuration</h3>
                  <p className="text-xs text-muted-foreground">Adjust display name, logo branding, and default categories.</p>
                </div>
                
                <div className="grid gap-4.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input 
                      id="siteName" 
                      name="siteName" 
                      value={settings.siteName} 
                      onChange={handleInputChange} 
                      required 
                      placeholder="e.g. KanpurAI Blog" 
                    />
                    <p className="text-3xs text-muted-foreground">Appears in title bar and website footer logo.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Textarea 
                      id="siteDescription" 
                      name="siteDescription" 
                      value={settings.siteDescription} 
                      onChange={handleInputChange} 
                      placeholder="Enter description..." 
                      className="min-h-[80px]"
                    />
                    <p className="text-3xs text-muted-foreground">Main meta description used for SEO indexing.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="logoUrl">Logo URL Path</Label>
                    <Input 
                      id="logoUrl" 
                      name="logoUrl" 
                      value={settings.logoUrl} 
                      onChange={handleInputChange} 
                      placeholder="/logo.png" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="defaultCategory">Default Blog Category</Label>
                    <Input 
                      id="defaultCategory" 
                      name="defaultCategory" 
                      value={settings.defaultCategory} 
                      onChange={handleInputChange} 
                      placeholder="e.g. Engineering" 
                    />
                    <p className="text-3xs text-muted-foreground">Applied to new draft blogs when not classified otherwise.</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="mt-0 outline-none">
              <div className="border border-border/80 bg-card rounded-lg p-6 space-y-6 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-foreground">SEO & Analytics Integration</h3>
                  <p className="text-xs text-muted-foreground">Configure search engine indexing links and traffic tracking hooks.</p>
                </div>

                <div className="grid gap-4.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="canonicalDomain">Canonical Domain URL</Label>
                    <Input 
                      id="canonicalDomain" 
                      name="canonicalDomain" 
                      value={settings.canonicalDomain} 
                      onChange={handleInputChange} 
                      required 
                      placeholder="https://kanpurai.blog" 
                    />
                    <p className="text-3xs text-muted-foreground">Used for generating canonical URL link tags on public articles.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                    <Input 
                      id="googleAnalyticsId" 
                      name="googleAnalyticsId" 
                      value={settings.googleAnalyticsId} 
                      onChange={handleInputChange} 
                      placeholder="G-XXXXXXXXXX" 
                    />
                    <p className="text-3xs text-muted-foreground">Integrates standard Google Analytics measurements (Gtag).</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="metaKeywords">Default Meta Keywords</Label>
                    <Input 
                      id="metaKeywords" 
                      name="metaKeywords" 
                      value={settings.metaKeywords} 
                      onChange={handleInputChange} 
                      placeholder="comma-separated tags..." 
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Comment Tab */}
            <TabsContent value="comments" className="mt-0 outline-none">
              <div className="border border-border/80 bg-card rounded-lg p-6 space-y-6 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Comment Moderation Controls</h3>
                  <p className="text-xs text-muted-foreground">Set moderation policies, spam blocking list, and anonymous rules.</p>
                </div>

                <div className="space-y-5">
                  {/* Auto Approve Toggle */}
                  <div className="flex items-start justify-between gap-4 p-3.5 bg-muted/20 border border-border/40 rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoApproveComments" className="font-semibold cursor-pointer">Auto-Approve Comments</Label>
                      <p className="text-3xs text-muted-foreground">New comments will appear live on public pages immediately.</p>
                    </div>
                    <input 
                      type="checkbox"
                      id="autoApproveComments"
                      name="autoApproveComments"
                      checked={settings.autoApproveComments}
                      onChange={(e) => handleCheckboxChange("autoApproveComments", e.target.checked)}
                      className="w-4 h-4 text-primary rounded border-border bg-transparent focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                  </div>

                  {/* Allow Guest Toggle */}
                  <div className="flex items-start justify-between gap-4 p-3.5 bg-muted/20 border border-border/40 rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowGuestComments" className="font-semibold cursor-pointer">Allow Guest Comments</Label>
                      <p className="text-3xs text-muted-foreground">Unauthenticated guest visitors can submit comments on articles.</p>
                    </div>
                    <input 
                      type="checkbox"
                      id="allowGuestComments"
                      name="allowGuestComments"
                      checked={settings.allowGuestComments}
                      onChange={(e) => handleCheckboxChange("allowGuestComments", e.target.checked)}
                      className="w-4 h-4 text-primary rounded border-border bg-transparent focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                  </div>

                  {/* Blacklist */}
                  <div className="space-y-1.5">
                    <Label htmlFor="restrictedWords">Restricted Words Filter</Label>
                    <Textarea 
                      id="restrictedWords" 
                      name="restrictedWords" 
                      value={settings.restrictedWords} 
                      onChange={handleInputChange} 
                      placeholder="crypto, spam, links..." 
                      className="min-h-[100px]"
                    />
                    <p className="text-3xs text-muted-foreground">Comments matching these phrases will be automatically set to pending/rejected review.</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="mt-0 outline-none">
              <div className="border border-border/80 bg-card rounded-lg p-6 space-y-6 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Security & API Keys</h3>
                  <p className="text-xs text-muted-foreground">Toggle maintenance overlays, configure session length, and manage backend API tokens.</p>
                </div>

                <div className="grid gap-5">
                  {/* Maintenance mode toggle */}
                  <div className="flex items-start justify-between gap-4 p-3.5 bg-muted/20 border border-border/40 rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="maintenanceMode" className="font-semibold cursor-pointer">Maintenance Mode</Label>
                      <p className="text-3xs text-muted-foreground">Block public readers with an elegant "Under Construction" overlay.</p>
                    </div>
                    <input 
                      type="checkbox"
                      id="maintenanceMode"
                      name="maintenanceMode"
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleCheckboxChange("maintenanceMode", e.target.checked)}
                      className="w-4 h-4 text-primary rounded border-border bg-transparent focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="sessionTimeout">Session Timeout Duration (Minutes)</Label>
                    <Input 
                      id="sessionTimeout" 
                      name="sessionTimeout" 
                      type="number"
                      value={settings.sessionTimeout} 
                      onChange={handleInputChange} 
                      required 
                      min="5" 
                      max="1440"
                    />
                    <p className="text-3xs text-muted-foreground">Number of inactive minutes before administrative users are auto signed out.</p>
                  </div>

                  {/* API Key management */}
                  <div className="space-y-2 border border-border/40 rounded-lg p-4 bg-card/40">
                    <div className="flex justify-between items-center">
                      <Label className="flex items-center gap-1.5 font-bold">
                        <Terminal className="h-4 w-4 text-primary" /> Platform Integration API Token
                      </Label>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="text-3xs h-7"
                        onClick={() => setApiKeyVisible(!apiKeyVisible)}
                      >
                        <Eye className="h-3 w-3 mr-1" /> {apiKeyVisible ? "Hide" : "Reveal"}
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        type={apiKeyVisible ? "text" : "password"} 
                        value={settings.apiKey} 
                        readOnly 
                        className="font-mono text-xs bg-muted/30 tracking-wide select-all" 
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="shrink-0"
                        onClick={handleGenerateApiKey}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-3xs text-muted-foreground">Used by client-side hooks to pull published posts for custom heads.</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Bottom Actions Form Footer */}
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button 
                type="submit" 
                disabled={pending} 
                className="flex items-center gap-2 rounded-lg px-5 shadow-none"
              >
                {pending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </Tabs>
    </form>
  );
}
