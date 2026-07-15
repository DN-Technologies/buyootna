"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@buyootna/ui";
import PageHeader from "@/components/PageHeader";

export default function BillingPage() {
  const handleExport = () => {
    alert("جاري تصدير بيانات الاشتراكات والفواتير...");
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <PageHeader 
        breadcrumbs={["الرئيسية","الاشتراكات والفواتير"]} 
        title="الاشتراكات والفواتير" 
        subtitle="متابعة عمليات الدفع، مراجعة الفواتير المصدرة وتدقيق الاشتراكات النشطة والمنتهية الصلاحية." 
        onExport={handleExport}
      />

      {/* Main Content card */}
      <Card className="bg-white border-[#ECECEC]">
        <CardHeader className="border-b border-[#ECECEC] pb-4">
          <CardTitle className="text-base font-['Cairo'] font-bold text-[#15304D]">قائمة البيانات</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-[#6B6A6A]">
            <p className="text-sm font-['Cairo'] mb-4">لا توجد بيانات لعرضها حالياً. هذه الصفحة عبارة عن هيكل جاهز للتطوير.</p>
            <Button variant="outline" className="font-['Cairo'] font-semibold text-xs border-[#ECECEC] hover:bg-[#F8F9FA]">
              إضافة جديد
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
