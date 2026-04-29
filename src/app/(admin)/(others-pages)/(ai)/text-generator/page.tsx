import AiLayout from "@/components/ai/AiLayout";
import AiPageBreadcrumb from "@/components/ai/AiPageBreadcrumb";
import TextGeneratorContent from "@/components/ai/TextGeneratorContent";
import React from "react";

export default function TextGeneratorPage() {
  return (
    <div>
      <AiPageBreadcrumb pageTitle="Text Generator" />
      <AiLayout>
        <TextGeneratorContent />
      </AiLayout>
    </div>
  );
}
