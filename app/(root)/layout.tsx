import React from "react";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {redirect} from "next/navigation";

export default async function Layout({children}: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);
    //@ts-ignore
    if (!session?.user?.id) {
         redirect("/login");
    }

    //@ts-ignore
    if(!session?.user?.isVerified) {
        redirect("/email-verification");
    }
    return (
      <>
          {children}
      </>

    )
}