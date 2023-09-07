import { db } from "@/db";
import Post from "./post";
import { auth, clerkClient } from "@clerk/nextjs";
import type { Post as PostType } from "@/db/schema";
import { notFound } from "next/navigation";

export default async function Posts({ tab }: { tab?: "all" | "program" }) {
  const { userId } = auth();

  if (!userId) notFound();

  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.id, userId),
    orderBy: (post, { desc }) => desc(post.created_at),
    with: {
      programs: true,
    },
  });

  if (!user) notFound();

  const posts = await db.query.posts.findMany({
    where: (post, { and, eq, isNull }) => {
      if (!tab)
        return and(isNull(post.deleted_at), eq(post.user_id, userId ?? ""));

      if (tab === "all") return isNull(post.deleted_at);
    },
    orderBy: (post, { desc }) => desc(post.created_at),
    with: {
      user: true,
    },
  });

  const usersFromPosts = await clerkClient.users.getUserList({
    userId: posts.map((post) => post.user && post.user.id),
  });

  return (
    <div className="flex flex-col">
      {posts.map((post) => {
        if (!post.user) return null;
        return (
          <Post
            key={post.id}
            post={{
              ...post,
              user: {
                ...usersFromPosts.find((user) => user.id === post.user.id)!,
              },
            }}
            isMyPost={post.user.id === userId}
          />
        );
      })}
    </div>
  );
}
