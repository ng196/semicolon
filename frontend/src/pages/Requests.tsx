import { useState } from "react";
import { ComingSoon } from "@/components/ComingSoon";
import { RequestsOriginal } from "./RequestsOriginal";

interface Request {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  submitted_to: string;
  category: string;
  submitter_id: number;
  submitter_name: string;
  submitter_avatar?: string;
  supporters: number;
  required: number;
  progress: number;
  resolution?: string;
  response_time?: string;
  submitted_at: string;
}

export default function Requests() {
  const [showPreview, setShowPreview] = useState(false);

  if (showPreview) {
    return <RequestsOriginal />;
  }

  return (
    <ComingSoon
      title="Requests"
      description="Submit and track campus improvement requests. This feature is coming soon!"
      onViewPreview={() => setShowPreview(true)}
    />
  );
}