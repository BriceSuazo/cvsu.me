"use client";

import CommentDropdown from "@/components/comment-dropdown";
import PostComment from "@/components/post-comment";
import PostDropdown from "@/components/post-dropdown";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { db } from "@/lib/db";
import { Comment } from "@/lib/db/schema";
import { api } from "@/lib/trpc/client";
import { auth, clerkClient } from "@clerk/nextjs";
import { Album, Briefcase, GraduationCap } from "lucide-react";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export default function PostPageComponent({ post_id }: { post_id: string }) {
  const postQuery = api.posts.getPost.useQuery({ post_id });

  return (
    <>
      {!postQuery.data || postQuery.isLoading ? (
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="flex gap-x-2">
              <div className="w-max">
                <Skeleton className="h-16 w-16 rounded-full" />
              </div>
              <div className="flex flex-1 flex-col">
                <div className="group flex items-center gap-x-2">
                  <Skeleton className="h-4 w-36" />
                  <div className="flex items-center gap-x-1">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-12 rounded-full bg-primary" />
                    <Skeleton className="h-5 w-12 rounded-full border" />
                  </div>
                  <Skeleton className="h-1 w-1" />
                  <div className="hidden sm:block">
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-4" />
            ))}
            <Skeleton className="h-4 w-1/2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-x-1">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>

            <div className="flex items-center gap-x-2">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-1 w-4" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          <div className="flex gap-x-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 flex-1 border bg-transparent" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between">
            <Link
              href={`/${postQuery.data.post.user.username}`}
              className="flex gap-x-2"
            >
              <div className="w-max">
                <Image
                  src={postQuery.data.post.user.imageUrl}
                  alt="Image"
                  width={64}
                  height={64}
                  className="rounded-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col">
                <div className="group flex items-center gap-x-2">
                  <p className="line-clamp-1 group-hover:underline">
                    {postQuery.data.post.user.firstName}{" "}
                    {postQuery.data.post.user.lastName}{" "}
                  </p>
                  <div className="flex items-center gap-x-1">
                    {(() => {
                      switch (postQuery.data.post.user.type) {
                        case "student":
                          return <Album />;
                        case "alumni":
                          return <Briefcase />;
                        case "faculty":
                          return <GraduationCap />;
                        default:
                          return null;
                      }
                    })()}
                    <Tooltip delayDuration={250}>
                      <TooltipTrigger>
                        <Badge>
                          {postQuery.data.post.user.program.college.campus.slug.toUpperCase()}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[12rem]">
                        {postQuery.data.post.user.program.college.campus.name}
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip delayDuration={250}>
                      <TooltipTrigger>
                        <Badge variant="outline">
                          {postQuery.data.post.user.program.slug.toUpperCase()}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[12rem]">
                        {postQuery.data.post.user.program.name}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="pointer-events-none hidden select-none sm:block">
                    ·
                  </p>
                  <div className="hidden sm:block">
                    <Tooltip delayDuration={250}>
                      <TooltipTrigger>
                        <p className="text-xs">
                          {moment(postQuery.data.post.created_at).fromNow()}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        {moment(postQuery.data.post.created_at).format(
                          "MMMM Do YYYY, h:mm:ss A",
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <p className="line-clamp-1 flex-1 break-all text-sm">
                  @{postQuery.data.post.user.username}
                </p>
              </div>
            </Link>

            {postQuery.data.userId === postQuery.data.post.user_id && (
              <PostDropdown
                post_id={postQuery.data.post.id}
                successUrl={`/${postQuery.data.post.user.username}`}
              />
            )}
          </div>

          <p>{postQuery.data.post.content}</p>

          <PostComment
            userId={postQuery.data.userId}
            post={postQuery.data.post}
            data-superjson
          />

          <div>
            {postQuery.data.post.comments.map((comment) => (
              <CommentComponent key={comment.id} comment={comment} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function CommentComponent({ comment }: { comment: Comment }) {
  const fullCommentQuery = api.comments.getFullComment.useQuery({
    comment_id: comment.id,
  });

  if (!fullCommentQuery.data || fullCommentQuery.isLoading)
    return (
      <div className="space-y-2 border p-4">
        <div className="flex justify-between">
          <div className="flex gap-x-2">
            <div className="min-w-max">
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-x-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-1 w-1" />
                <div className="hidden sm:block">
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Skeleton className="h-4" />
      </div>
    );

  return (
    <div className="space-y-2 border p-4">
      <div className="flex justify-between">
        <div className="flex gap-x-2">
          <div className="min-w-max">
            <Link href={`/${fullCommentQuery.data.comment.user.username}`}>
              <Image
                src={fullCommentQuery.data.comment.user.imageUrl}
                alt=""
                width={40}
                height={40}
                className="aspect-square rounded-full"
              />
            </Link>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-x-2">
              <Link href={`/${fullCommentQuery.data.comment.user.username}`}>
                <p className="line-clamp-1 group-hover:underline">
                  {fullCommentQuery.data.comment.user.firstName}{" "}
                  {fullCommentQuery.data.comment.user.lastName}{" "}
                </p>
              </Link>
              <p className="pointer-events-none hidden select-none sm:block">
                ·
              </p>
              <div className="hidden sm:block">
                <Tooltip delayDuration={250}>
                  <TooltipTrigger>
                    <p className="text-xs">
                      {moment(
                        fullCommentQuery.data.comment.created_at,
                      ).fromNow()}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    {moment(fullCommentQuery.data.comment.created_at).format(
                      "MMMM Do YYYY, h:mm:ss A",
                    )}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <Link href={`/${fullCommentQuery.data.comment.user.username}`}>
              <p className="line-clamp-1 flex-1 break-all text-sm">
                @{fullCommentQuery.data.comment.user.username}
              </p>
            </Link>
          </div>
        </div>
        {fullCommentQuery.data.comment.user_id ===
          fullCommentQuery.data.userId && (
          <CommentDropdown comment_id={comment.id} />
        )}
      </div>
      <p>{fullCommentQuery.data.comment.content}</p>
    </div>
  );
}
