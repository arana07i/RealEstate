import { createClient } from "@/lib/supabase/server";
import { type Inquiry, type InquiryStatus } from "@/lib/types";
import { logger } from "@/lib/logger";

export async function getInquiries(status?: InquiryStatus, agencyId?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("inquiries")
    .select("*, listings:property_id(title,location)")
    .order("created_at", { ascending: false });

  if (agencyId) query = query.eq("agency_id", agencyId);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;

  if (error) {
    logger.error("getInquiries error", { status, message: error.message });
    return [];
  }

  return (data ?? []) as Inquiry[];
}

export async function getInquiryStats(agencyId?: string) {
  const supabase = await createClient();

  let query = supabase.from("inquiries").select("status");

  if (agencyId) query = query.eq("agency_id", agencyId);

  const { data, error } = await query;

  if (error) return { total: 0, newCount: 0, contacted: 0, closed: 0, spam: 0 };

  const inquiries = data ?? [];
  return {
    total: inquiries.length,
    newCount: inquiries.filter((i: { status: string }) => i.status === "new").length,
    contacted: inquiries.filter((i: { status: string }) => i.status === "contacted").length,
    closed: inquiries.filter((i: { status: string }) => i.status === "closed").length,
    spam: inquiries.filter((i: { status: string }) => i.status === "spam").length,
  };
}

export async function updateInquiryStatus(id: string, status: InquiryStatus, agencyId?: string) {
  const supabase = await createClient();

  let query = supabase.from("inquiries").update({ status });

  if (agencyId) query = query.eq("agency_id", agencyId);

  const { error } = await query.eq("id", id);

  if (error) {
    logger.error("updateInquiryStatus error", { id, status, message: error.message });
    return false;
  }

  return true;
}
