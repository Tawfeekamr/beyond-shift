'use client'

import { SessionProvider } from 'next-auth/react'
import React from "react";

type Props = {
    children?: React.ReactNode,
    session: any
}

export const AuthProviders = ({ children, session }: Props) => {
    return <SessionProvider session={session}>{children}</SessionProvider>
}