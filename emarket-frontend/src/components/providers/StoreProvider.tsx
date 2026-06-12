"use client"
import { useCartStore } from "@/stores/useCartStore";
import { useEffect } from "react";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        useCartStore.getState().initCart();
    }, []);

    return <>{children}</>;
}
