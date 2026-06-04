import { Badge } from "@/components/ui/badge";
import { BlogStatus } from "@/lib/enums";
const map: Record<BlogStatus, { v: any; label: string }> = {
  DRAFT: { v: "secondary", label: "Draft" },
  PENDING_REVIEW: { v: "warning", label: "Pending review" },
  APPROVED: { v: "success", label: "Approved" },
  PUBLISHED: { v: "success", label: "Published" },
  REJECTED: { v: "destructive", label: "Rejected" },
  ARCHIVED: { v: "outline", label: "Archived" },
};
export function StatusBadge({ status }: { status: string }) {
  const m = map[status as BlogStatus] || { v: "secondary", label: status };
  return <Badge variant={m.v}>{m.label}</Badge>;
}
