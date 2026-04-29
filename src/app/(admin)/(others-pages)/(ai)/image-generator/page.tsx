import AiLayout from "@/components/ai/AiLayout";
import AiPageBreadcrumb from "@/components/ai/AiPageBreadcrumb";
import ImageGeneratorContent from "@/components/ai/ImageGeneratorContent";
import React from "react";

export default function page() {
  return (
    <div>
      <AiPageBreadcrumb pageTitle="Image Generator" />
      <AiLayout>
        <ImageGeneratorContent />
      </AiLayout>
    </div>
  );
}
