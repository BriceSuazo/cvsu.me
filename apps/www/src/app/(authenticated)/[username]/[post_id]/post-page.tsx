"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import {
  Album,
  Briefcase,
  GraduationCap,
  Heart,
  MessageCircle,
} from "lucide-react";

import type { RouterOutputs } from "@kabsu.me/api";

import { ImagesViewer } from "~/components/images-viewer";
import PostComment from "~/components/post-comment";
import PostDropdown from "~/components/post-dropdown";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Textarea } from "~/components/ui/textarea";
import { Toggle } from "~/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import VerifiedBadge from "~/components/verified-badge";
import { api } from "~/lib/trpc/client";
import { cn, formatText } from "~/lib/utils";
import CommentDropdown from "./comment-dropdown";

export default function PostPageComponent({ post_id }: { post_id: string }) {
  const [openImagesViewer, setOpenImagesViewer] = useState(false);
  const postQuery = api.posts.getPost.useQuery({ post_id }, { retry: 1 });
  const [scrollTo, setScrollTo] = useState(0);

  if (postQuery.error?.data?.code === "NOT_FOUND") {
    notFound();
  }

  return (
    <>
      <ImagesViewer
        open={openImagesViewer}
        setOpen={setOpenImagesViewer}
        images={
          postQuery.data?.post.posts_images.map((image) => ({
            id: image.id,
            url: image.signed_url,
          })) ?? []
        }
        scrollTo={scrollTo}
      />
      {postQuery.isLoading ? (
        <div className="min-h-screen space-y-2 p-4">
          <div className="flex justify-between">
            <div className="flex gap-x-2">
              <div className="w-max">
                <Skeleton className="h-16 w-16 rounded-full" />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <div className="group flex items-center gap-x-1">
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-1 w-1" />

                  <Skeleton className="h-3 w-10" />
                </div>
                <div className="flex items-center gap-x-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-5 w-12 rounded-full bg-primary" />
                  <Skeleton className="h-5 w-12 rounded-full border" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {[...(Array(2) as number[])].map((_, i) => (
              <Skeleton key={i} className="h-4" />
            ))}
            <Skeleton className="h-4 w-1/2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-x-1">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>

            <div className="flex items-center gap-x-4">
              <div className="flex items-center gap-x-1">
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-1 w-4" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          <div className="flex gap-x-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 flex-1 border bg-transparent" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      ) : !postQuery.data || postQuery.isError ? (
        <p className="text-center text-sm text-muted-foreground">
          {postQuery.error?.message ?? "Something went wrong."}
        </p>
      ) : (
        <div className="min-h-screen space-y-2">
          <div className="flex flex-col gap-y-4 p-4">
            <div className="flex justify-between">
              <Link
                href={`/${postQuery.data.post.user.username}`}
                className="flex gap-x-2"
              >
                <div className="w-max">
                  {postQuery.data.post.user.image_name ? (
                    <Image
                      src={postQuery.data.post.user.image_url}
                      alt={`${postQuery.data.post.user.name} profile picture`}
                      width={56}
                      height={56}
                      className="aspect-square rounded-full object-cover"
                    />
                  ) : (
                    <Image
                      src="/default-avatar.jpg"
                      alt={`${postQuery.data.post.user.name} profile picture`}
                      width={56}
                      height={56}
                      className="aspect-square rounded-full object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-center gap-x-2">
                    <div className="flex gap-x-1">
                      {(() => {
                        switch (postQuery.data.post.user.type) {
                          case "student":
                            return <Album />;
                          case "alumni":
                            return <GraduationCap />;
                          case "faculty":
                            return <Briefcase />;
                          default:
                            return null;
                        }
                      })()}
                      <p className="line-clamp-1 font-semibold hover:underline">
                        {postQuery.data.post.user.name}
                      </p>
                    </div>

                    {postQuery.data.post.user.verified_at && <VerifiedBadge />}

                    <p className="pointer-events-none select-none">·</p>
                    <Tooltip delayDuration={250}>
                      <TooltipTrigger>
                        <p className="hidden text-xs text-muted-foreground hover:underline xs:block">
                          {formatDistanceToNow(postQuery.data.post.created_at, {
                            includeSeconds: true,
                            addSuffix: true,
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground hover:underline xs:hidden">
                          {formatDistanceToNow(postQuery.data.post.created_at, {
                            includeSeconds: true,
                            addSuffix: true,
                          })}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        {format(postQuery.data.post.created_at, "PPpp")}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <p className="line-clamp-1 break-all text-sm text-foreground/70 hover:underline">
                      @{postQuery.data.post.user.username}{" "}
                    </p>
                    <div className="flex items-center gap-x-1">
                      <Tooltip delayDuration={250}>
                        <TooltipTrigger>
                          <Badge>
                            {postQuery.data.post.user.programs?.colleges?.campuses?.slug.toUpperCase()}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[12rem]">
                          {
                            postQuery.data.post.user.programs?.colleges
                              ?.campuses?.name
                          }
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip delayDuration={250}>
                        <TooltipTrigger>
                          <Badge variant="outline">
                            {postQuery.data.post.user.programs?.slug.toUpperCase()}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[12rem]">
                          {postQuery.data.post.user.programs?.name}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </Link>

              <PostDropdown
                post_id={postQuery.data.post.id}
                successUrl={`/${postQuery.data.post.user.username}`}
                isMyPost={postQuery.data.userId === postQuery.data.post.user_id}
              />
            </div>

            <div className="whitespace-pre-wrap break-words">
              {formatText(postQuery.data.post.content)}
            </div>

            {postQuery.data.post.posts_images.length > 0 && (
              <div
                className={cn(
                  "grid grid-cols-3 gap-2",
                  postQuery.data.post.posts_images.length === 1 &&
                    "grid-cols-1",
                  postQuery.data.post.posts_images.length === 2 &&
                    "grid-cols-2",
                  postQuery.data.post.posts_images.length > 3 && "grid-cols-3",
                )}
              >
                {postQuery.data.post.posts_images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => {
                      setOpenImagesViewer(true);
                      setScrollTo(index);
                    }}
                  >
                    <Image
                      src={image.signed_url}
                      alt={image.name}
                      width={400}
                      height={400}
                      priority
                      className="aspect-square rounded-lg object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <PostComment
              userId={postQuery.data.userId}
              post={postQuery.data.post}
              data-superjson
            />
          </div>

          <div className="p-4 pt-0">
            {postQuery.data.post.comments.map((comment) => (
              <CommentComponent
                key={comment.id}
                comment={comment}
                userId={postQuery.data.userId}
                post_id={postQuery.data.post.id}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function CommentComponent({
  comment,
  userId,
  post_id,
}: {
  comment: RouterOutputs["posts"]["getPost"]["post"]["comments"][number];
  userId: string;
  post_id: string;
}) {
  const fullCommentQuery = api.comments.getFullComment.useQuery({
    comment_id: comment.id,
  });
  const [likes, setLikes] = useState(fullCommentQuery.data?.comment.likes);
  const [commentEnabled, setCommentEnabled] = useState(false);

  const likeCommentMutation = api.comments.like.useMutation();
  const unlikeCommentMutation = api.comments.unlike.useMutation();
  const replyCommentMutation = api.comments.reply.useMutation();
  const [reply, setReply] = useState("");

  useEffect(() => {
    setLikes(fullCommentQuery.data?.comment.likes);
  }, [fullCommentQuery.data?.comment.likes]);

  return (
    <>
      {!fullCommentQuery.data ? (
        <div className="space-y-2">
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
      ) : (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between">
            <div className="flex gap-x-2">
              <div className="min-w-max">
                <Link href={`/${fullCommentQuery.data.comment.users.username}`}>
                  <Image
                    src={
                      fullCommentQuery.data.comment.users.image_name
                        ? fullCommentQuery.data.comment.users.image_url
                        : "/default-avatar.jpg"
                    }
                    alt={`${fullCommentQuery.data.comment.users.name} profile picture`}
                    width={40}
                    height={40}
                    className="aspect-square rounded-full object-cover object-center"
                  />
                </Link>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-x-2">
                  <Link
                    href={`/${fullCommentQuery.data.comment.users.username}`}
                    className="flex items-center gap-x-1"
                  >
                    <p className="line-clamp-1 font-bold group-hover:underline">
                      {fullCommentQuery.data.comment.users.name}
                    </p>
                    {fullCommentQuery.data.comment.users.verified_at && (
                      <VerifiedBadge size="sm" />
                    )}
                  </Link>
                  <p className="pointer-events-none select-none">·</p>

                  <Tooltip delayDuration={250}>
                    <TooltipTrigger>
                      <p className="hidden text-xs text-muted-foreground hover:underline xs:block">
                        {formatDistanceToNow(
                          fullCommentQuery.data.comment.created_at,
                          {
                            includeSeconds: true,
                            addSuffix: true,
                          },
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground hover:underline xs:hidden">
                        {formatDistanceToNow(
                          fullCommentQuery.data.comment.created_at,
                          {
                            includeSeconds: true,
                            addSuffix: true,
                          },
                        )}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>
                      {format(fullCommentQuery.data.comment.created_at, "PPpp")}
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Link
                  href={`/${fullCommentQuery.data.comment.users.username}`}
                  className="line-clamp-1 flex-1 break-all text-sm text-foreground/70 hover:underline"
                >
                  @{fullCommentQuery.data.comment.users.username}
                </Link>
              </div>
            </div>

            <CommentDropdown
              comment_id={comment.id}
              isMyComment={
                fullCommentQuery.data.comment.user_id ===
                fullCommentQuery.data.userId
              }
            />
          </div>
          <div className="whitespace-pre-wrap break-words">
            {formatText(fullCommentQuery.data.comment.content)}
          </div>

          <div className="flex gap-x-1">
            <Toggle
              size="sm"
              pressed={likes?.some((like) => like.user_id === userId)}
              onClick={(e) => e.stopPropagation()}
              onPressedChange={async (pressed) => {
                if (likes === undefined) return;

                if (pressed) {
                  setLikes([...likes, { user_id: userId }]);

                  await likeCommentMutation.mutateAsync({
                    comment_id: comment.id,
                  });
                } else {
                  setLikes(likes.filter((like) => like.user_id !== userId));

                  await unlikeCommentMutation.mutateAsync({
                    comment_id: comment.id,
                  });
                }
                await fullCommentQuery.refetch();
              }}
            >
              <Heart
                className={cn(
                  "mr-1.5 h-4 w-4",
                  likes?.some((like) => like.user_id === userId) &&
                    "fill-primary text-primary",
                )}
              />
              <span className="text-xs">{likes?.length ?? 0}</span>
            </Toggle>

            <Toggle
              size="sm"
              pressed={commentEnabled}
              onPressedChange={(pressed) => setCommentEnabled(pressed)}
            >
              <MessageCircle className="mr-1.5 h-4 w-4" />
              <span className="text-xs">
                {
                  (fullCommentQuery.data.comment.replies as { id: string }[])
                    .length
                }
              </span>
            </Toggle>
          </div>
          <div className="pl-4">
            {fullCommentQuery.data.comment.replies.map((reply) => (
              <CommentComponent
                userId={userId}
                comment={reply}
                post_id={post_id}
              />
            ))}
            {commentEnabled && (
              <div className="space-y-2">
                <Textarea
                  placeholder="Reply"
                  disabled={replyCommentMutation.isPending}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
                <Button
                  className="ml-auto"
                  size="sm"
                  disabled={replyCommentMutation.isPending}
                  onClick={async () => {
                    await replyCommentMutation.mutateAsync({
                      comment_id: comment.id,
                      content: reply,
                      post_id,
                    });
                    setReply("");
                    setCommentEnabled(false);
                    await fullCommentQuery.refetch();
                  }}
                >
                  {replyCommentMutation.isPending ? "Replying..." : "Reply"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
