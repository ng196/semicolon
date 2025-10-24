import { useState } from "react";
import { ComingSoon } from "@/components/ComingSoon";
import { NetworkOriginal } from "./NetworkOriginal";

interface User {
  id: number;
  name: string;
  specialization: string;
  year: string;
  avatar: string;
  online?: boolean;
  sharedClasses?: string[];
  attendanceRate?: number;
  interests?: string[];
  lastSeen?: string;
}

export default function Network() {
  const [showPreview, setShowPreview] = useState(false);

  if (showPreview) {
    return <NetworkOriginal />;
  }

  return (
    <ComingSoon
      title="Network"
      description="Connect with classmates and build your campus network. This feature is coming soon!"
      onViewPreview={() => setShowPreview(true)}
    />
  );
}


