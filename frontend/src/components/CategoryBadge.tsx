import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const getCategoryStyles = (category: string) => {
    const normalized = category.toLowerCase().replace(/\s+/g, "-");
    
    const styles: Record<string, string> = {
      "electronics": "bg-blue-100 text-blue-700 border-blue-200",
      "books": "bg-purple-100 text-purple-700 border-purple-200",
      "furniture": "bg-green-100 text-green-700 border-green-200",
      "sports": "bg-orange-100 text-orange-700 border-orange-200",
      "clothing": "bg-pink-100 text-pink-700 border-pink-200",
      "career": "bg-blue-100 text-blue-700 border-blue-200",
      "workshop": "bg-purple-100 text-purple-700 border-purple-200",
      "sports-event": "bg-green-100 text-green-700 border-green-200",
      "cultural": "bg-pink-100 text-pink-700 border-pink-200",
      "academic": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "technical": "bg-blue-100 text-blue-700 border-blue-200",
      "project": "bg-blue-100 text-blue-700 border-blue-200",
      "club": "bg-purple-100 text-purple-700 border-purple-200",
    };
    
    return styles[normalized] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        getCategoryStyles(category),
        className
      )}
    >
      {category}
    </span>
  );
}
