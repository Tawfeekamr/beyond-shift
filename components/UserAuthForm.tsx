"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {useSession} from "next-auth/react";
import {Button} from "@/components/ui/button";
import { Icons } from "./Icons";
import {LoginForm} from "@/components/LoginForm";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
    const {data: session} = useSession();
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    return (
        <div className={cn("grid gap-6", className)} {...props}>
            <div className="grid gap-2">
                <LoginForm/>
            </div>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
                </div>
            </div>
            <Button variant="outline" type="button" disabled={isLoading}>
                {isLoading ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Icons.bLogo className="p-5 my-2 mx-auto" />
                )}{" "}
            </Button>
        </div>
    )
}
