import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "prisma", "settings.json");

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  logoUrl: string;
  defaultCategory: string;
  canonicalDomain: string;
  googleAnalyticsId: string;
  metaKeywords: string;
  autoApproveComments: boolean;
  allowGuestComments: boolean;
  restrictedWords: string;
  sessionTimeout: number;
  maintenanceMode: boolean;
  apiKey: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "KanpurAI Blog",
  siteDescription: "The latest insights on AI engineering, products, and tech.",
  logoUrl: "/logo.png",
  defaultCategory: "Engineering",
  canonicalDomain: "https://kanpurai.blog",
  googleAnalyticsId: "G-KNP4AI2026",
  metaKeywords: "AI, KanpurAI, machine learning, technology, SaaS, Next.js",
  autoApproveComments: true,
  allowGuestComments: false,
  restrictedWords: "spam, scam, crypto, click here",
  sessionTimeout: 60,
  maintenanceMode: false,
  apiKey: "ka_live_8f37bc902de1247b9d7ef4012e8b",
};

export function getSettings(): SiteSettings {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error("Error reading settings.json", error);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: Partial<SiteSettings>): SiteSettings {
  try {
    const current = getSettings();
    const updated = { ...current, ...settings };
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf-8");
    return updated;
  } catch (error) {
    console.error("Error writing settings.json", error);
    throw new Error("Failed to save settings");
  }
}
