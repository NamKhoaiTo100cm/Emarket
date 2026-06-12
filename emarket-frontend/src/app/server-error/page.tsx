
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RefreshCw, ServerIcon } from "lucide-react";

// export default function ServerErrorPage() {
//     return (
//         <div className="flex flex-col items-center justify-center h-screen">
//             <div className="p-10 rounded-full bg-red-100 mb-4">
//                 <ServerIcon className="text-9xl text-red-500" />
//             </div>
//             <h1 className="text-4xl font-bold mb-4">Lỗi kết nối đến server</h1>
//             <p className="text-lg text-gray-600 mb-8">Vui lòng thử lại sau</p>
//             <Button><Link href={'/'}>Quay lại trang chủ</Link></Button>
//         </div>
//     );
// }


import { RotateCcw, Home, ShoppingCart } from "lucide-react";

export default function ErrorPage() {
    const fakeReasons = [
        "Seller forgot to confirm the order.",
        "Warehouse accidentally entered another dimension.",
        "Server is currently drinking coffee.",
        "Someone deployed on Friday evening.",
        "Inventory count fought with Prisma.",
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
                        Error connect to server
                    </h1>

                    <p className="text-lg font-light text-white/90 md:text-2xl">
                        We&apos;re trying absolutely nothing and hoping it fixes itself.
                    </p>

                    {/* Fake progress */}
                    <div className="pt-4 text-2xl font-light">
                        73% complete
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