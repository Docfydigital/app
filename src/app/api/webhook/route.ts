import { NextRequest, NextResponse } from "next/server";
import { handleWebhook } from "@/lib/webhook-handler";

export async function POST(request: NextRequest) {
  try {
    // Optional: verify webhook secret
    const secret = request.headers.get("x-webhook-secret");
    const expectedSecret = process.env.WEBHOOK_SECRET;
    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();

    if (!payload.event) {
      return NextResponse.json({ error: "Missing event field" }, { status: 400 });
    }

    const result = await handleWebhook(payload);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "WhatsApp CRM Webhook endpoint. Send POST requests here.",
    supported_events: [
      "new_message",
      "new_contact",
      "update_status",
      "move_pipeline",
      "create_alert",
      "create_task",
      "assistant_action",
    ],
  });
}
