import { getMe } from "@/actions/auth.action";
import { Footer } from "@/components/layout/Footer";
import Headers from "@/components/layout/Header";
import AnnouncementBar from "@/components/ui/announcement-bar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen flex flex-col pt-12 px-2 pb-2 box-border">
      <Headers />
      <div className="flex-grow">
        {children}
      </div>
      <Footer />
    </div>
  );
}