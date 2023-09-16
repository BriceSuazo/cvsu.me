import { auth } from "@clerk/nextjs";
import PostForm from "@/components/post-form";
import Posts from "@/components/posts";
import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/header";
import AuthForm from "@/components/auth-form";
import PostSkeleton from "@/components/post-skeleton";
import PostTypeTab from "@/components/post-type-tab";
import AboutDev from "@/components/about-dev";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import Footer from "@/components/footer";

export function generateMetadata(): Metadata {
  const { userId } = auth();

  return {
    title: userId
      ? "Home - CvSU.me"
      : "Welcome! - CvSU.me | Social Media for Cavite State University",
  };
}

export default function Home({
  searchParams: { tab },
}: {
  searchParams: { tab?: "all" | "program" | "college" };
}) {
  const { userId } = auth();

  return (
    <main className="container">
      {userId ? (
        <>
          <Header />
          <div className="space-y-8">
            <PostForm />

            <PostTypeTab />

            <Suspense
              fallback={
                <div>
                  {[...Array(6)].map((_, i) => (
                    <PostSkeleton key={i} />
                  ))}
                </div>
              }
            >
              <Posts tab={!tab ? "following" : tab} />
            </Suspense>
          </div>
        </>
      ) : (
        <AuthForm />
      )}
    </main>
  );
}
