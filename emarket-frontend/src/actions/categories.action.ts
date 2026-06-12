import { serverFetch } from "@/lib/serverApi";
export const getCategories = async () => {
    try {
        const res = await serverFetch(`/category`, {
            method: "GET",
        });
        const data = res.data;
        return data;
    } catch (error) {
        console.log(error);
    }
    return []
}