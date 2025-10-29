import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = (status: string) => {
    const normalized = status.toLowerCase().replace(/\s+/g, "-");
    
    switch (normalized) {
      case "pending":
      case "awaiting-response":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "in-review":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "resolved":
        return "bg-green-100 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        getStatusStyles(status),
        className
      )}
    >
      {status}
    </span>
  );
}
