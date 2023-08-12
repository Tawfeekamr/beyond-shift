import {getServerSession} from "next-auth/next";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {AiFillCheckCircle} from "react-icons/ai";
import Link from "next/link";

export default async function Page() {
    const session = await getServerSession(authOptions);

    //@ts-ignore
    if (session?.user?.isVerified) {
        return (<>
            <div className={"flex mx-auto justify-center items-center"}><AiFillCheckCircle/>
                <p className={"mx-2"}>Your
                Account is Verified</p>
            </div>
            <div>
                <Link href={"/dashboard"}>Back</Link>
            </div>
        </>)
    }
    return (
        <>
            <>Email</>
        </>
    )
}