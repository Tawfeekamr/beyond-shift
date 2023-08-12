
export default async function Layout({children}: { children: React.ReactNode }) {

    return (
        <main className="flex min-h-screen flex-col items-center justify-between px-24 py-16">
            <>
                {children}
            </>
        </main>
        )
}