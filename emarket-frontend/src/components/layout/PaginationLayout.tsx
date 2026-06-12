"use client"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "../ui/pagination";

interface Props {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const PaginationLayout = ({ currentPage, totalPages, onPageChange }: Props) => {
    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious href="#" onClick={() => onPageChange(currentPage - 1)} className={currentPage === 1 ? "cursor-not-allowed pointer-events-none opacity-50" : ""} />
                </PaginationItem>

                {
                    currentPage <= 3 && <>
                        {Array.from({ length: Math.min(totalPages, 4) }).map((_, index) => (
                            <PaginationItem key={index}>
                                <PaginationLink href="#" onClick={() => onPageChange(index + 1)} isActive={index + 1 === currentPage}>{index + 1}</PaginationLink>
                            </PaginationItem>
                        ))}
                        {
                            totalPages > 4 && <>
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationLink href="#" onClick={() => onPageChange(totalPages)}>{totalPages}</PaginationLink>
                                </PaginationItem>
                            </>
                        }
                    </>
                }
                {
                    (currentPage > 3 && currentPage <= totalPages - 3) && <>
                        <PaginationItem>
                            <PaginationLink href="#" onClick={() => onPageChange(1)}>{1}</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationEllipsis />
                        </PaginationItem>
                        {Array.from({ length: 3 }).map((_, index) => (
                            <PaginationItem key={index}>
                                <PaginationLink href="#" onClick={() => onPageChange(currentPage + index - 1)} isActive={index === 1} >{currentPage + index - 1}</PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#">{totalPages}</PaginationLink>
                        </PaginationItem>
                    </>
                }
                {
                    currentPage > totalPages - 3 && currentPage >= 4 && <>
                        {
                            totalPages > 4 && <>
                                <PaginationItem>
                                    <PaginationLink href="#" onClick={() => onPageChange(1)}>{1}</PaginationLink>
                                </PaginationItem>
                                <PaginationItem></PaginationItem>
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            </>
                        }

                        {Array.from({ length: 4 }).map((_, index) => (
                            <PaginationItem key={index}>
                                <PaginationLink href="#" onClick={() => onPageChange(totalPages - 3 + index)} isActive={totalPages - 3 + index === currentPage}>{totalPages - 3 + index}</PaginationLink>
                            </PaginationItem>
                        ))}

                    </>
                }
                <PaginationItem>
                    <PaginationNext href="#" onClick={() => onPageChange(currentPage + 1)} className={currentPage === totalPages ? "cursor-not-allowed pointer-events-none opacity-50" : ""} />
                </PaginationItem>
            </PaginationContent>
        </Pagination>)
}