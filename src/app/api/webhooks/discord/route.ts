import { NextResponse } from "next/server";

// This endpoint can be used by internal services or clients to dispatch discord notifications
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, message, url } = body;

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn("DISCORD_WEBHOOK_URL is not set.");
      return NextResponse.json({ error: "Discord webhook not configured" }, { status: 500 });
    }

    const discordPayload = {
      content: `**${title}**\n${message}\n${url ? url : ''}`
    };

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(discordPayload)
    });

    if (!res.ok) {
      throw new Error(`Discord API returned ${res.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Discord webhook error:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
