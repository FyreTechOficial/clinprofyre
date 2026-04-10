import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const tenantId = formData.get("tenant_id") as string;

    if (!file || !tenantId) {
      return NextResponse.json({ error: "file e tenant_id obrigatórios" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Upload to Supabase Storage
    const ext = file.name.split(".").pop() || "png";
    const fileName = `logos/${tenantId}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("clinpro")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      // If bucket doesn't exist, try creating it
      if (uploadError.message?.includes("not found")) {
        await supabase.storage.createBucket("clinpro", { public: true });
        await supabase.storage.from("clinpro").upload(fileName, buffer, {
          contentType: file.type,
          upsert: true,
        });
      } else {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("clinpro").getPublicUrl(fileName);
    const logoUrl = urlData.publicUrl;

    // Update tenant
    await supabase
      .from("tenants")
      .update({ logo_url: logoUrl })
      .eq("id", tenantId);

    return NextResponse.json({ success: true, logo_url: logoUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
