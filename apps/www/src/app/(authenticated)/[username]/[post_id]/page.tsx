import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createClient as createClientAdmin } from "@kabsu.me/supabase/client/admin";
import { createClient as createClientServer } from "@kabsu.me/supabase/client/server";

import DeactivatedBanned from "~/components/deactivated-banned";
import { api } from "~/lib/trpc/server";
import { extractAllMentions, REGEX } from "~/lib/utils";
import PostPageComponent from "./post-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; post_id: string }>;
}): Promise<Metadata> {
  const { username, post_id } = await params;
  const supabaseServer = await createClientServer();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  if (!user) notFound();

  const supabaseAdmin = createClientAdmin();

  const { data: post } = await supabaseAdmin
    .from("posts")
    .select("content, type, user_id")
    .eq("id", post_id)
    .is("deleted_at", null)
    .single();

  if (!post) notFound();

  if ((post.user_id !== user.id && post.type) === "following") {
    const { data: is_follower } = await supabaseAdmin
      .from("followers")
      .select()
      .eq("follower_id", user.id)
      .eq("followee_id", post.user_id)
      .single();

    if (!is_follower) notFound();
  }

  const { data: current_user_in_db } = await supabaseAdmin
    .from("users")
    .select("*, programs(*, colleges(*))")
    .eq("id", user.id)
    .single();

  if (!current_user_in_db) notFound();

  const { data: user_of_post } = await supabaseAdmin
    .from("users")
    .select(`*, programs(*, colleges(*))`)
    .eq("id", post.user_id)
    .single();

  if (!user_of_post) notFound();

  if (
    post.type === "program" &&
    current_user_in_db.program_id !== user_of_post.program_id
  )
    notFound();

  if (
    post.type === "college" &&
    current_user_in_db.programs.college_id !== user_of_post.programs.college_id
  )
    notFound();

  if (
    post.type === "campus" &&
    current_user_in_db.programs.colleges.campus_id !==
      user_of_post.programs.colleges.campus_id
  )
    notFound();

  try {
    const mentioned = extractAllMentions(post.content);

    const { data } = await supabaseAdmin.rpc("get_mention", {
      user_ids: mentioned,
    });

    const formatMentions = (text: string) => {
      if (!text) return "";

      // Replace mentions
      const formattedText = text.replace(REGEX, (_, p1) => {
        const user = data?.find((user) => user.id === p1);

        return `@${user ? user.username : p1}`;
      });

      return formattedText;
    };

    return {
      title: `${formatMentions(post.content)} - @${username}`,
    };
  } catch (error) {
    console.log(error);
  }

  return {
    title: `${post.content} - @${username}`,
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ username: string; post_id: string }>;
}) {
  const { username, post_id } = await params;
  const getPost = await api.posts.getPost({ username, post_id });

  if (getPost.post.user.banned_at) return <DeactivatedBanned type="banned" />;

  if (getPost.post.user.deactivated_at)
    return <DeactivatedBanned type="deactivated" />;

  return (
    <>
      {/* <UpdatePost open={openUpdate} setOpen={setOpenUpdate} post={post} /> */}
      {/* <DeletePost open={openDelete} setOpen={setOpenDelete} post_id={post.id} /> */}

      <PostPageComponent
        getPost={getPost}
        username={username}
        post_id={post_id}
      />
    </>
  );
}
