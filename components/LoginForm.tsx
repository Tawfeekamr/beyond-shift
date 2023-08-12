"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {useForm} from "react-hook-form";
import {redirect, useRouter} from 'next/navigation'
import {CHECK_COMPLEX_PASSWORD} from "@/utils/regex";
import {useToast} from "@/components/ui/use-toast";
import {Icons} from "@/components/Icons";
import {useState} from "react";

const formSchema = z.object({
    email: z.string().min(5, {
        message: "email must be at least 5 characters.",
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }).regex(CHECK_COMPLEX_PASSWORD, "Password must have at least one: lowercase, uppercase, digit, special character."),
})

export function LoginForm() {
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const { toast } = useToast();

    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        setLoading(true);
        signIn("credentials", {
            ...values
       , redirect: false     }).then((res) => {
            console.log("res",res);
            if(res?.error && res?.error !== "undefined") {
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: "There was a problem with your request.",
                })
           }
            setTimeout(() => {
                router.push("/dashboard");
            }, 2000)

        })
            .catch((err) => {
            console.error("err",err);
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: "There was a problem with your request.",
                })
        }).finally(() => {
            setTimeout(() => {
                setLoading(false)
            }, 4000)
        })

    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type={"email"} placeholder="Email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input className={"w-[350px]"} placeholder="Password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button className={"w-full"} type="submit" disabled={loading}>{loading ? <Icons.spinner className="mx-2" /> : null} Submit</Button>
            </form>
        </Form>
    )
}
