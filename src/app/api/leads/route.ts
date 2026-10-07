import { createLeadHandler } from "@/lib/lead-handler";
import { saveLead } from "@/lib/lead-repository";

export const POST = createLeadHandler(saveLead);
