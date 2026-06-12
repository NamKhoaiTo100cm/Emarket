import { getMe } from "@/actions/auth.action";
import HeaderContent from "./HeaderContent";

export default async function Header() {
    const res = await getMe();
    const user = res?.data;
    console.log("user in header", user);
    return (
        <HeaderContent user={user} />
    )
}