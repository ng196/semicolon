import { useState } from "react";
import { ComingSoon } from "@/components/ComingSoon";
import { MarketplaceOriginal } from "./MarketplaceOriginal";

interface MarketplaceItem {
  id: string | number;
  title: string;
  description: string;
  price: number;
  type: string;
  category: string;
  condition: string;
  image: string;
  seller_id: number;
  seller_name: string;
  seller_avatar: string;
  seller_rating: number;
  liked: number;
  posted_at: string;
}

export default function Marketplace() {
  const [showPreview, setShowPreview] = useState(false);

  if (showPreview) {
    return <MarketplaceOriginal />;
  }

  return (
    <ComingSoon
      title="Marketplace"
      description="Buy and sell items with your campus community. This feature is coming soon!"
      onViewPreview={() => setShowPreview(true)}
    />
  );
}