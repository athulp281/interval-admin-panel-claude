import AiLayout from "@/components/ai/AiLayout";
import AiPageBreadcrumb from "@/components/ai/AiPageBreadcrumb";
import CodeGeneratorContent from "@/components/ai/CodeGeneratorContent";
import React from "react";

export default function CodeGeneratorPage() {
  return (
    <div>
      <AiPageBreadcrumb pageTitle="Code Generator" />
      <AiLayout>
        <CodeGeneratorContent />
      </AiLayout>
    </div>
  );
}
