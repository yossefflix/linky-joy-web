import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const txId = searchParams.get("txId");

  if (!txId) {
    return NextResponse.json({ error: "Transaction ID required" }, { status: 400 });
  }

  try {
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("delivery_status, iptv_accounts(username, password)")
      .eq("paddle_transaction_id", txId)
      .single();

    if (error || !order) {
      // Return pending if not found yet (webhook might take a few seconds)
      return NextResponse.json({ status: "pending" });
    }

    const responsePayload: any = {
      status: order.delivery_status
    };

    // Always expose credentials on the success page securely as fallback or primary display
    if (order.iptv_accounts) {
      const accounts = Array.isArray(order.iptv_accounts) 
        ? order.iptv_accounts[0] 
        : (order.iptv_accounts as any);
        
      if (accounts) {
        responsePayload.credentials = {
          username: accounts.username,
          password: accounts.password
        };
      }
    }

    return NextResponse.json(responsePayload);
    
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
