import AiLayout from "@/components/ai/AiLayout";
import AiPageBreadcrumb from "@/components/ai/AiPageBreadcrumb";
import VideoGeneratorContent from "@/components/ai/VideoGeneratorContent";
import React from "react";

export default function page() {
  return (
    <div>
      <AiPageBreadcrumb pageTitle="Video Generator" />
      <AiLayout>
        <VideoGeneratorContent />
      </AiLayout>
    </div>
  );
}
