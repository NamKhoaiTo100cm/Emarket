// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

type JwtPayload = {
    role: string;
    exp: number;
};

function isTokenExpired(token: string): boolean {
    try {
        const payload = jwtDecode<JwtPayload>(token);
        return payload.exp * 1000 < Date.now() + 10_000;
    } catch {
        return true;
    }
}

function getRoleFromToken(token: string): string {
    try {
        const payload = jwtDecode<JwtPayload>(token);
        return payload.role ?? "";
    } catch {
        return "";
    }
}

function buildRedirectByRole(
    role: string,
    path: string,
    isGuestOnly: boolean,
    requestUrl: string
): NextResponse | null {
    if (isGuestOnly) {
        return NextResponse.redirect(new URL("/", requestUrl));
    }
    if (role === "admin" && !path.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/admin/dashboard", requestUrl));
    }
    if (role === "staff" && !path.startsWith("/staff")) {
        return NextResponse.redirect(new URL("/staff/dashboard", requestUrl));
    }
    return null;
}

export default async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    const accessToken = request.cookies.get("access_token")?.value;
    const refreshToken = request.cookies.get("refresh_token")?.value;

    const isGuestOnly = ["/login", "/register"].includes(path);

    const publicPaths = ["/", "/product-detail", "/shop-detail", "/search", "/callback"];
    const isPublic =
        publicPaths.some((p) => path === p || path.startsWith(p + "/")) ||
        isGuestOnly;

    // =========================================================
    // Chưa đăng nhập → chặn private route
    // =========================================================
    if (!accessToken && !refreshToken && !isPublic) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // =========================================================
    // Cần refresh token
    // =========================================================
    const needsRefresh =
        refreshToken && (!accessToken || isTokenExpired(accessToken));

    if (needsRefresh) {
        try {
            const refreshRes = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh`,
                {
                    method: "POST",
                    headers: { Cookie: `refresh_token=${refreshToken}` },
                }
            );

            if (refreshRes.ok) {
                const setCookie = refreshRes.headers.get("set-cookie");
                const newAccess = setCookie?.match(/access_token=([^;]+)/)?.[1];

                if (newAccess) {
                    // Decode role từ token mới
                    const role = getRoleFromToken(newAccess);

                    // Xử lý redirect theo role TRƯỚC khi return
                    const roleRedirect = buildRedirectByRole(
                        role,
                        path,
                        isGuestOnly,
                        request.url
                    );
                    if (roleRedirect) {
                        roleRedirect.cookies.set("access_token", newAccess, {
                            httpOnly: true,
                            path: "/",
                            maxAge: 15 * 60,
                            sameSite: "lax",
                            secure: process.env.NODE_ENV === "production",
                        });
                        return roleRedirect;
                    }

                    // Không cần redirect → patch request + ghi cookie
                    const requestHeaders = new Headers(request.headers);
                    requestHeaders.set(
                        "cookie",
                        `access_token=${newAccess}; refresh_token=${refreshToken}`
                    );

                    const patchedResponse = NextResponse.next({
                        request: { headers: requestHeaders },
                    });
                    patchedResponse.cookies.set("access_token", newAccess, {
                        httpOnly: true,
                        path: "/",
                        maxAge: 15 * 60,
                        sameSite: "lax",
                        secure: process.env.NODE_ENV === "production",
                    });

                    return patchedResponse;
                }
            } else {
                // Refresh thất bại
                if (!isPublic) {
                    return NextResponse.redirect(
                        new URL("/login?error=expired", request.url)
                    );
                }
                return NextResponse.next();
            }
        } catch {
            if (!isPublic) {
                return NextResponse.redirect(new URL("/login", request.url));
            }
            return NextResponse.next();
        }
    }

    // =========================================================
    // Access token còn hạn → decode role bình thường
    // =========================================================
    let role = "";
    if (accessToken && !isTokenExpired(accessToken)) {
        role = getRoleFromToken(accessToken);
    }

    const isAdmin = role === "admin";
    const isStaff = role === "staff";
    const hasShop = role === "seller";

    if (path.startsWith("/admin") && !isAdmin) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    if (path.startsWith("/staff") && !isStaff) {
        return NextResponse.redirect(new URL("/", request.url));
    }



    // Admin redirect
    if (isAdmin && !path.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    // Staff redirect
    if (isStaff && !path.startsWith("/staff")) {
        return NextResponse.redirect(new URL("/staff/dashboard", request.url));
    }

    // Staff vào "/" không có referer → redirect dashboard
    if (path === "/") {
        const referer = request.headers.get("referer");
        if (!referer && isStaff) {
            return NextResponse.redirect(
                new URL("/staff/dashboard", request.url)
            );
        }
    }

    // Đã login mà vào guest-only
    if ((accessToken || refreshToken) && isGuestOnly) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // Staff không được vào seller
    if (isStaff && path.startsWith("/seller")) {
        return NextResponse.redirect(
            new URL("/staff/dashboard", request.url)
        );
    }

    // Seller rồi mà vào setup-shop
    if (hasShop && path === "/seller/setup-shop") {
        return NextResponse.redirect(
            new URL("/seller/dashboard/orders-manager", request.url)
        );
    }

    // Chưa seller mà vào seller page
    if (
        !hasShop &&
        path.startsWith("/seller/") &&
        path !== "/seller/setup-shop"
    ) {
        return NextResponse.redirect(
            new URL("/seller/setup-shop", request.url)
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
    ],
};