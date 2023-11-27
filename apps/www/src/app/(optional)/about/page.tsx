import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@kabsu.me/auth";
import { DEVS_INFO } from "@kabsu.me/constants";

export default async function AboutPage() {
  const session = await auth();

  if (!session) redirect("/");
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-center text-4xl font-bold text-primary">About</h1>
        <p className="text-center text-base [text-wrap:balance] sm:text-lg">
          We believe that having this platform is essential for bringing
          together Cavite State University students, faculty, and alumni in a
          way that&apos;s exclusive and focused.
        </p>
      </div>
      <div>
        <h4 className=" text-center text-xl font-semibold text-primary">
          Who are we?
        </h4>
        <p className="mx-auto max-w-lg text-center">
          We are a group of passionate computer science students at Cavite State
          University - Main Campus.
        </p>
      </div>
      <div className="mx-auto mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {DEVS_INFO.map((dev) => {
          return (
            <div
              key={dev.index}
              className="flex flex-col items-center gap-y-4 rounded-lg border-2 p-3 "
            >
              <Image
                src={dev.image}
                alt={dev.name}
                className="rounded-full saturate-0"
                width="80"
                height="80"
              />
              <div className="flex flex-col items-center text-center">
                <p className="font-semibold">{dev.name}</p>
                <p className="text-sm">{dev.role}</p>
                <div className="flex gap-x-1 pt-2">
                  {dev.links.map((link, i) => {
                    return (
                      <Link
                        key={i}
                        href={link.url}
                        target="_blank"
                        className="hover:text-primary"
                      >
                        <div className="grid place-items-center p-1">
                          <link.icon size="1rem" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
