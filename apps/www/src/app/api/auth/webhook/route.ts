import { headers } from "next/headers";
import { env } from "@/lib/env.mjs";
import { clerkClient } from "@clerk/nextjs/server";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { Webhook } from "svix";

import { db } from "@cvsu.me/db";
import { deleted_users, users } from "@cvsu.me/db/schema";

const webhookSecret: string = env.WEBHOOK_SECRET || "";

export async function POST(req: Request) {
  const payload = (await req.json()) as Record<string, unknown>;
  const payloadString = JSON.stringify(payload);
  const headerPayload = headers();
  const svixId = headerPayload.get("svix-id");
  const svixIdTimeStamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");
  if (!svixId || !svixIdTimeStamp || !svixSignature) {
    return new Response("Error occured", {
      status: 400,
    });
  }
  // Create an object of the headers
  const svixHeaders = {
    "svix-id": svixId,
    "svix-timestamp": svixIdTimeStamp,
    "svix-signature": svixSignature,
  };
  // Create a new Webhook instance with your webhook secret
  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;
  try {
    // Verify the webhook payload and headers
    evt = wh.verify(payloadString, svixHeaders) as WebhookEvent;
  } catch (_) {
    console.log("error");
    return new Response("Error occured", {
      status: 400,
    });
  }
  const { id } = evt.data;
  // Handle the webhook
  const eventType = evt.type;
  if (!id)
    return new Response("Error occured", {
      status: 400,
    });
  //   if (eventType === "user.created") {
  //     console.log(`User ${id} was ${eventType}`);

  //     const username =
  //       evt.data.username ??
  //       evt.data.email_addresses[0].email_address.split("@")[0];

  //     await clerkClient.users.updateUser(id, {
  //       username,
  //     });

  //     const usersInDB = await db.query.users.findMany();
  //     const deletedUsersInDB = await db.query.deleted_users.findMany();

  //     await db.insert(users).values({
  //       id,
  //       user_number: usersInDB.length + deletedUsersInDB.length + 1,
  //       program_id: "",
  //       type: "student",
  //     });
  //   } else
  if (eventType === "user.deleted") {
    console.log(`User ${id} was ${eventType}`);

    const user = await db.query.users.findFirst({
      where: (user, { eq }) => eq(user.id, id),
    });

    if (user) {
      await db.insert(deleted_users).values({
        id: user.id,
        user_number: user.user_number,
      });

      await db.delete(users).where(eq(users.id, id));
    }
  } else if (eventType === "user.updated") {
    console.log(`User ${id} was ${eventType}`);

    const user = await clerkClient.users.getUser(id);

    if (user.imageUrl !== evt.data.image_url) {
      await db
        .update(users)
        .set({
          profile_picture_url: user.imageUrl,
        })
        .where(eq(users.id, id));
    }

    if (user.username !== evt.data.username) {
      await db
        .update(users)
        .set({
          username: user.username ?? evt.data.username ?? "",
        })
        .where(eq(users.id, id));
    }

    if (user.firstName !== evt.data.first_name) {
      await db
        .update(users)
        .set({
          first_name: user.firstName ?? evt.data.first_name ?? "",
        })
        .where(eq(users.id, id));
    }

    if (user.lastName !== evt.data.last_name) {
      await db
        .update(users)
        .set({
          last_name: user.lastName ?? evt.data.last_name ?? "",
        })
        .where(eq(users.id, id));
    }
  } else {
    console.log(`User ${id} was ${eventType}`);
  }

  return new Response("", {
    status: 201,
  });
}
