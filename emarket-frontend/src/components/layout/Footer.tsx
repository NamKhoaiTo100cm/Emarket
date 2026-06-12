"use client";

import { Button } from "@/components/ui/button";
import { FaBitcoin, FaCcMastercard, FaCcVisa, FaFacebook, FaFacebookF, FaGithub } from "react-icons/fa";
import { GiMoneyStack } from "react-icons/gi";
import { RiInstagramFill } from "react-icons/ri";

export function Footer() {
    return (
        <footer className="border-t">
            <div className="mx-auto w-full px-4 lg:px-6">
                {/* Grid container with headings and links */}
                <div className="grid sm:grid-cols-2 gap-8 py-8 md:grid-cols-4">
                    {footerLinks.map((item) => (
                        <div key={item.title}>
                            <h3 className="mb-4 text-lg">{item.title}</h3>
                            <ul className="space-y-2 text-muted-foreground text-sm">
                                {item.links.map((link) => (
                                    <li key={link.label}>
                                        <a className="hover:text-foreground" href={link.href}>
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    <div className="flex flex-wrap gap-2">
                        <div>
                            <h3 className="mb-4 text-lg">Phương thức thanh toán</h3>
                            <ul className="flex gap-3 space-y-2 text-muted-foreground text-sm">

                                <li>
                                    <a className="text-foreground text-4xl">
                                        <FaCcVisa />
                                    </a>
                                </li>
                                <li>
                                    <a className="text-foreground text-4xl">
                                        <FaCcMastercard />
                                    </a>
                                </li>
                                <li>
                                    <a className="text-foreground text-4xl">
                                        <FaBitcoin />
                                    </a>
                                </li>
                                <li>
                                    <a className="text-foreground text-4xl">
                                        <GiMoneyStack />
                                    </a>
                                </li>




                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-4 text-lg">Tải ứng dụng</h3>
                            <div className="flex flex-warp gap-4">
                                <Button asChild className="h-11">
                                    <a href="#">
                                        <PlayStoreIcon className="size-5" />
                                        <div className="flex flex-col items-start justify-center pr-2 text-left">
                                            <span className="font-light text-[10px] leading-none tracking-tighter">
                                                GET IT ON
                                            </span>
                                            <p className="font-bold text-base leading-none">
                                                Google Play
                                            </p>
                                        </div>
                                    </a>
                                </Button>

                                <Button asChild className="h-11">
                                    <a href="#">
                                        <AppleIcon className="size-5" />
                                        <div className="flex flex-col items-start justify-center pr-2 text-left">
                                            <span className="text-[10px] leading-none tracking-tighter">
                                                Download on the
                                            </span>
                                            <p className="font-bold text-base leading-none">App Store</p>
                                        </div>
                                    </a>
                                </Button>

                            </div>
                        </div>
                        <div>
                            <h3 className="mb-4 text-lg">Kết nối với chúng tôi</h3>
                            <div className="flex items-center gap-2">
                                {socialLinks.map(({ icon, href }, index) => (
                                    <Button
                                        asChild
                                        key={`social-${href}-${index}`} // More descriptive prefix
                                        size="icon-sm"
                                        variant="outline"
                                    >
                                        <a href={href}>{icon}</a>
                                    </Button>
                                ))}
                            </div>
                        </div>


                    </div>
                    {/* Social Buttons + App Links */}
                    <div className="flex flex-wrap items-center justify-between gap-4 py-5">



                    </div>
                </div>
                <div className="h-px bg-border" />


                <div className="py-4 text-center text-muted-foreground text-xs">
                    <p>&copy; {new Date().getFullYear()} Emarket by Nam</p>
                </div>
            </div>
        </footer>
    );
}
const footerLinks = [
    {
        title: "Hỗ trợ khách hàng",
        links: [
            { href: "#", label: "Hotline: 123456789" },
            { href: "#", label: "Các câu hỏi thường gặp" },
            { href: "#", label: "Hướng dẫn đặt hàng" },
            { href: "#", label: "Phương thức vận chuyển" },
        ],
    },
    {
        title: "Về E-Store",
        links: [
            { href: "#", label: "Giới thiệu E-Store" },
            { href: "#", label: "Điều khoản sử dụng" },
            { href: "#", label: "Điều khoản bảo mật" },
            { href: "#", label: "Chính sách giải quyết khiếu nại" },
        ],
    },
    {
        title: "Hợp tác và liên kết",
        links: [
            { href: "#", label: "Quy chế hoạt động" },
            { href: "#", label: "Bán hàng cùng E-Store" },
            { href: "#", label: "Chứng nhận bởi" },
            { href: "#", label: "Chăm sóc bán hàng" },
        ],
    },
];
const socialLinks = [
    {
        icon: (
            <FaFacebook />

        ),
        href: "#",
    },
    {
        icon: (
            <RiInstagramFill />
        ),
        href: "#",
    },
    {
        icon: (
            <FaGithub />
        ),
        href: "#",
    },
    {
        icon: <XIcon />,
        href: "#",
    },
];

function XIcon(props: React.ComponentProps<"svg">) {
    return (
        <svg
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path d="m18.9,1.153h3.682l-8.042,9.189,9.46,12.506h-7.405l-5.804-7.583-6.634,7.583H.469l8.6-9.831L0,1.153h7.593l5.241,6.931,6.065-6.931Zm-1.293,19.494h2.039L6.482,3.239h-2.19l13.314,17.408Z" />
        </svg>
    );
}

function PlayStoreIcon({
    fill = "currentColor",
    ...props
}: React.ComponentProps<"svg">) {
    return (
        <svg fill={fill} viewBox="0 0 24 24" {...props}>
            <path d="m21.762,9.942L4.67.378c-.721-.466-1.635-.504-2.393-.099-.768.411-1.246,1.208-1.246,2.08v19.282c0,.872.477,1.668,1.246,2.079.755.404,1.668.37,2.393-.098l17.092-9.564c.756-.423,1.207-1.192,1.207-2.058s-.451-1.635-1.207-2.058Zm-5.746-1.413l-2.36,2.36L5.302,2.534l10.714,5.995ZM2.604,21.906V2.094l9.941,9.906L2.604,21.906Zm2.698-.439l8.355-8.355,2.36,2.36-10.714,5.995Zm15.692-8.78l-3.552,1.987-2.674-2.674,2.674-2.674,3.552,1.987c.363.203.402.548.402.686s-.039.483-.402.686Z" />
        </svg>
    );
}

function AppleIcon({
    fill = "currentColor",
    ...props
}: React.ComponentProps<"svg">) {
    return (
        <svg fill={fill} viewBox="0 0 24 24" {...props}>
            <g id="_Group_2">
                <g id="_Group_3">
                    <path
                        d="M18.546,12.763c0.024-1.87,1.004-3.597,2.597-4.576c-1.009-1.442-2.64-2.323-4.399-2.378    c-1.851-0.194-3.645,1.107-4.588,1.107c-0.961,0-2.413-1.088-3.977-1.056C6.122,5.927,4.25,7.068,3.249,8.867    c-2.131,3.69-0.542,9.114,1.5,12.097c1.022,1.461,2.215,3.092,3.778,3.035c1.529-0.063,2.1-0.975,3.945-0.975    c1.828,0,2.364,0.975,3.958,0.938c1.64-0.027,2.674-1.467,3.66-2.942c0.734-1.041,1.299-2.191,1.673-3.408    C19.815,16.788,18.548,14.879,18.546,12.763z"
                        id="_Path_"
                    />
                    <path
                        d="M15.535,3.847C16.429,2.773,16.87,1.393,16.763,0c-1.366,0.144-2.629,0.797-3.535,1.829    c-0.895,1.019-1.349,2.351-1.261,3.705C13.352,5.548,14.667,4.926,15.535,3.847z"
                        id="_Path_2"
                    />
                </g>
            </g>
        </svg>
    );
}
