import { Skeleton } from "@/components/ui/skeleton"

export default function SkeletonProductDetail() {
    return (
        <div className='flex flex-col w-full gap-4 lg:px-20'>
            <div className="flex flex-row w-full gap-4">
                <Skeleton className="sm:w-1/2 h-[400px]" />
                <div className='sm:w-1/2 flex flex-col gap-3'>
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-12 w-2/3" />
                    <Skeleton className="h-10 w-1/4" />
                    <Skeleton className="h-16 w-full mt-5" />
                    <Skeleton className="h-16 w-full" />
                </div>
            </div>
            <Skeleton className="w-full h-20" />
        </div>
    )
}
