import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const plan = searchParams.get("plan");

  if (!plan) {
    return NextResponse.json({ error: "Plan parameter is required" }, { status: 400 });
  }

  try {
    // Check available inventory for this specific plan duration
    const { count, error } = await supabaseAdmin
      .from("iptv_accounts")
      .select("*", { count: "exact", head: true })
      .eq("plan_duration", parseInt(plan))
      .eq("status", "available");

    if (error) throw error;

    return NextResponse.json({
      availableCount: count || 0,
      inStock: (count || 0) > 0
    });
    
  } catch (err: any) {
    console.error("Inventory check error:", err);
    return NextResponse.json({ error: `يوجد خطأ: ${err.message || JSON.stringify(err)}` }, { status: 500 });
  }
}
