"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function addAccountAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const plan_duration = parseInt(formData.get("plan_duration") as string);

  if (!username || !password || !plan_duration) {
    return { error: "جميع الحقول مطلوبة" };
  }

  try {
    const { error } = await supabaseAdmin
      .from("iptv_accounts")
      .insert([{
        username,
        password,
        plan_duration,
        status: "available"
      }]);

    if (error) throw error;
    
    // Clear cache to refresh UI if we had one
    revalidatePath("/admin/inventory");
    
    return { success: true };
  } catch (err: any) {
    console.error("Add account error:", err);
    return { error: "فشل في إضافة الحساب للقاعدة." };
  }
}
