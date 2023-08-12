"use client";

import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl, FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {useForm} from "react-hook-form";
import axios from "axios";
import {useParams, useRouter} from 'next/navigation'
import {useState} from "react";
import {toast, useToast} from "@/components/ui/use-toast";
import {useSession} from "next-auth/react";

const formSchema = z.object({
    otp: z.string().min(8, {
        message: "OTP must be at least 8 characters.",
    }),
})

export function OTPForm() {
    const router = useRouter();
    const params = useParams();
    const {data: sessionData} = useSession();
    const { toast } = useToast();
    const [disabled, setDisabled] = useState(false);
    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            otp: "",
        },
    });

    //@ts-ignore
    const userId = sessionData?.user?.id || null;
    console.debug("sessionData",sessionData?.user)
    if(!userId) {
        return <>Loading...</>
    }
    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        // event.preventDefault();
        console.debug("id",userId)

        //@ts-ignore
        axios.post("/api/check-otp", {...values, id: userId}).then((res) => {
            router.push(`/dashboard`);
        }).catch((err) => {
            console.debug("Error", err);
            toast({
                variant: "destructive",
                title: "OTP Error",
                description: err?.response?.data || "There was a problem with your request.",
            });
        });
        form.reset();
    }

    const generateOTP = () => {
        setDisabled(true);
        axios.post("/api/generate-otp", {id: userId}).then((res) => {
            toast({
                variant: "default",
                title: "OTP Generated",
                description: res?.data || "OTP created successfully.",
            });
            setTimeout(() => {
                setDisabled(false);
            }, 15 * 60 * 100);
        }).catch((err) => {
            toast({
                variant: "destructive",
                title: "Generate OTP failed",
                description: err?.response?.data || "There was a problem with your request.",
            });
        });
        form.reset();

    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email Verification</FormLabel>
                            <FormControl>
                                <Input type={"otp"} placeholder="OTP code" {...field} />
                            </FormControl>
                            <FormDescription>{"We notice you didn't verify your email, please check your email. "}</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className={"flex justify-start space-x-4"}>
                    <Button type="submit">Submit</Button>

                    <Button disabled={disabled} type="button" variant={"secondary"} onClick={generateOTP}>Resend</Button>
                </div>

            </form>
        </Form>
    )
}
