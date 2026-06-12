'use client' // Error boundaries must be Client Components

import { Home, RefreshCw, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react'

export default function ErrorPage({
    error,
    unstable_retry,
}: {
    error: Error & { digest?: string }
    unstable_retry: () => void
}) {
    // useEffect(() => {
    //     // Log the error to an error reporting service
    //     console.error(error)
    // }, [error])

    // return (
    //     <div>
    //         <h2>Something went wrong!</h2>
    //         <button
    //             onClick={
    //                 // Attempt to recover by re-fetching and re-rendering the segment
    //                 () => unstable_retry()
    //             }
    //         >
    //             Try again
    //         </button>
    //     </div>
    // )

    const [percentToReload, setPercentToReload] = useState<number>(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setPercentToReload(prev => prev + 25);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (percentToReload >= 100) {
            window.location.reload();
        }
    }, [percentToReload])

    const fakeReasons = [
        "Thằng dev code ngu vcl",
        // "Nhà kho đi lạc vào chiều không gian khác.",
        // "Server đang uống trà sữa.",
        // "Tối thứ 6 deploy.",
        // "Số lượng hàng tồn kho cãi nhau với Prisma.",
    ];

    const randomReason =
        fakeReasons[Math.floor(Math.random() * fakeReasons.length)];

    return (
        <main className="min-h-screen bg-[#0078D7] text-white overflow-hidden">
            <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-8 lg:px-16">
                {/* Sad face */}
                <div className="mb-6 text-[120px] font-thin leading-none">:(</div>

                {/* Main text */}
                <div className="space-y-5">
                    <h1 className="max-w-4xl text-3xl font-light leading-tight md:text-5xl">
                        {error?.message}
                    </h1>

                    <p className="text-lg font-light text-white/90 md:text-2xl">
                        We&apos;re trying absolutely nothing and hoping it fixes itself.
                    </p>

                    {/* Fake progress */}
                    <div className="pt-4 text-2xl font-light">
                        {percentToReload}% to reload
                    </div>

                    {/* Funny debug text */}
                    <div className="space-y-2 pt-8 text-white/80">
                        <p>
                            Possible reason:{" "}
                            <span className="font-medium text-white">
                                {randomReason}
                            </span>
                        </p>

                        <p className="font-mono text-sm">
                            STOP CODE: EMARKET_MELTDOWN
                        </p>

                        <p className="font-mono text-sm">
                            WHAT FAILED: probably_the_backend.ts
                        </p>
                    </div>

                    {/* Fake QR + info */}
                    <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-start">
                        <div className="grid size-28 grid-cols-6 gap-[2px] bg-white p-2">
                            {Array.from({ length: 36 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={Math.random() > 0.45 ? "bg-black" : "bg-white"}
                                />
                            ))}
                        </div>

                        <div className="max-w-md text-sm text-white/85">
                            Scan this QR code for more information about this issue.
                            <br />
                            (It does absolutely nothing.)
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-12 flex flex-wrap gap-4">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 rounded-md border border-white/40 px-5 py-3 text-sm transition hover:bg-white/10"
                        >
                            <Home className="size-4" />
                            Go Home
                        </Link>

                        <Link
                            href="/cart"
                            className="inline-flex items-center gap-2 rounded-md border border-white/40 px-5 py-3 text-sm transition hover:bg-white/10"
                        >
                            <ShoppingCart className="size-4" />
                            Save My Cart
                        </Link>

                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 rounded-md border border-white/40 px-5 py-3 text-sm transition hover:bg-white/10"
                        >
                            <RefreshCw className="size-4" />
                            Pretend To Refresh
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}