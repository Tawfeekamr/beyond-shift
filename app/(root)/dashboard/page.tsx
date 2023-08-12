"use client";
import {Button} from "@/components/ui/button";
import {signOut} from "next-auth/react";

export default function Home() {
    return (
      <div>
          <p>Dashboard</p>
          <Button className={""} onClick={() => signOut()}>Logout</Button>
      </div>
    )
}
