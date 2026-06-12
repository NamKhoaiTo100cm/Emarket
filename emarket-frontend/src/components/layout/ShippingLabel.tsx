import React from "react";
import QRCode from "react-qr-code";
import { useBarcode } from 'next-barcode';


interface Product {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

interface Customer {
    id: number;
    name: string;
    phone: string;
    address: string;
    email: string;
}

interface ShippingLabelProps {
    orderCode: string;
    trackingCode?: string;
    customer: Customer;
    senderName?: string;
    senderAddress?: string;
    senderPhone?: string;
    products: Product[];
    codAmount: number;
    paymentMethod?: string;  // 'cod' | 'banking' | 'momo' | 'zalopay'
    weight?: string;
    deliveryMethod?: string;
    routeCode?: string;
    ward?: string;
    createdAt: string;
}

const ShippingLabel = React.forwardRef<HTMLDivElement, ShippingLabelProps>(
    (
        {
            orderCode,
            trackingCode,
            customer,
            senderName = "Emarket Store",
            senderAddress = "123 Nguyễn Huệ, P. Bến Nghé, Q.1, TP.HCM",
            senderPhone = "1900 xxxx",
            products,
            codAmount,
            paymentMethod = 'cod',
            weight = "500g",
            deliveryMethod = "express",
            routeCode = "HN - HUB",
            ward = "HÀ ĐÔNG",
            createdAt,
        },
        ref
    ) => {
        const totalQty = products.reduce((sum, p) => sum + p.quantity, 0);
        const genTrackingCode =
            trackingCode ?? `EMK${orderCode.replace(/\D/g, "").padStart(10, "0")}`;
        const { inputRef } = useBarcode({
            value: genTrackingCode,
            options: {
                displayValue: false,
                width: 1,
                height: 50,
                margin: 0,
                format: "code39"
            },
        });
        return (
            <div
                ref={ref}
                className="w-[105mm] border-2 border-black bg-white text-black text-[11px] font-mono"
            >
                {/* Header */}
                <div className="flex justify-between items-start px-3 py-2 border-b-2 border-black border-dashed gap-2">
                    <div>
                        <div className="text-lg font-bold text-[#e85d04] tracking-tight">
                            Emarket
                        </div>
                        <div className="text-[9px] text-gray-500 mt-0.5">Giao hàng nhanh</div>
                    </div>
                    <div className="text-right">
                        {/* <Barcode value={genTrackingCode} format={"CODE39"} displayValue={false} width={0.8} height={30} className="border border-amber-200" /> */}
                        <svg ref={inputRef} />
                        <div className="text-[10px] font-semibold tracking-wide mt-0.5">
                            Mã vận đơn: {genTrackingCode}
                        </div>
                        <div className="text-[9px] text-gray-500">Mã đơn hàng: {orderCode}</div>
                    </div>
                </div>

                {/* Addresses */}
                <div className="grid grid-cols-2 border-b-2 border-black border-dashed">
                    <div className="p-2 border-r border-black">
                        <div className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Người gửi
                        </div>
                        <div className="font-semibold">{senderName}</div>
                        <div className="text-[10px] text-gray-600 leading-snug mt-0.5">
                            {senderAddress}
                        </div>
                        <div className="text-[10px] mt-0.5">SĐT: {senderPhone}</div>
                    </div>
                    <div className="p-2">
                        <div className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Người nhận
                        </div>
                        <div className="font-semibold">{customer.name}</div>
                        <div className="text-[10px] text-gray-600 leading-snug mt-0.5">
                            {customer.address}
                        </div>
                        <div className="text-[10px] mt-0.5">SĐT: {customer.phone}</div>
                    </div>
                </div>

                {/* Route bar */}
                <div className="flex justify-between items-center px-3 py-1.5 border-b-2 border-black border-dashed bg-gray-100">
                    <div className="text-xl font-bold tracking-widest">{routeCode}</div>
                    <div className="text-sm font-bold text-right leading-snug">{ward}</div>
                </div>

                {/* Products + QR */}
                <div className="grid grid-cols-[1fr_auto] border-b-2 border-black border-dashed">
                    <div className="p-2 relative border-r border-black">
                        <div className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Nội dung hàng (tổng SL: {totalQty})
                        </div>
                        {products.map((p, i) => (
                            <div key={p.id} className="text-[10px] leading-relaxed">
                                {i + 1}. {p.name}, SL: {p.quantity}
                            </div>
                        ))}
                        <h1 className="text-center font-bold text-xs absolute bottom-0 left-0 w-full">Lưu ý khách nhận phải quay video quá trình bóc hàng để bảo hành có hiệu lực</h1>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1 min-w-[85px]">
                        <QRCode value={orderCode} className="m-2 w-20 h-20" />
                        {/* <div className="text-[10px] font-semibold tracking-wide">
                            {orderCode.slice(-7).toUpperCase()}
                        </div> */}
                        <div className="border-t border-black w-full"></div>
                        <h1 className="text-[10px]">Ngày đặt hàng</h1>
                        <div className="text-[10px] font-semibold">{createdAt}</div>
                    </div>
                </div>

                {/* COD + Delivery note - chỉ hiện nếu thanh toán COD */}
                {paymentMethod === 'cod' ? (
                    <div className="grid grid-cols-[auto_1fr] border-b-2 border-black border-dashed">
                        <div className="flex flex-col items-center justify-center px-3 py-2 border-r border-black border-dashed">
                            <div className="text-[9px] text-gray-500 uppercase tracking-wide">
                                Tiền thu hộ (COD)
                            </div>
                            <div className="text-xl font-bold whitespace-nowrap">
                                {Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                }).format(codAmount)}
                            </div>
                            <div className="text-[9px] text-gray-500">
                                {deliveryMethod === "express" ? "Giao nhanh" : "Tiêu chuẩn"}
                            </div>
                        </div>
                        {/* Signatures */}
                        <div className="p-2 min-h-[80px]">
                            <div className="text-[9px] text-gray-500 uppercase tracking-wide text-center">
                                Chữ ký người nhận
                                <br />
                                Xác nhận hàng nguyên vẹn không móp méo bể vỡ
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-[auto_1fr] border-b-2 border-black border-dashed">
                        <div className="flex flex-col items-center justify-center px-3 py-2 border-r border-black border-dashed">
                            <div className="text-[9px] text-gray-500 uppercase tracking-wide">
                                Thanh toán
                            </div>
                            <div className="text-sm font-bold whitespace-nowrap uppercase mt-1 px-2 py-0.5 border border-black rounded">
                                {paymentMethod === 'banking' ? 'Chuyển khoản' : paymentMethod?.toUpperCase()}
                            </div>
                            <div className="text-[9px] text-green-600 font-semibold mt-1">Đã thanh toán</div>
                        </div>
                        <div className="p-2 min-h-[80px]">
                            <div className="text-[9px] text-gray-500 uppercase tracking-wide text-center">
                                Chữ ký người nhận
                                <br />
                                Xác nhận hàng nguyên vẹn không móp méo bể vỡ
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center">
                    <div className="p-1 text-[10px] leading-relaxed text-center">
                        <div className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">
                            Hướng dẫn giao hàng
                        </div>
                        <b>Được đồng kiểm.</b>
                        <br />
                        {/* Gọi điện trước khi giao.
                        <br /> */}
                        Chụp ảnh khi giao hàng.
                        <br />
                        Khi khách có dấu hiệu bom hàng, quỵt tiền hoàn hàng và báo cáo.
                        <br />

                        KL tối đa: <span className="font-semibold px-1.5 border border-black rounded">{weight}</span>
                        <div>
                            Hoàn hàng sau 3 lần phát · Lưu kho tối đa 5 ngày
                        </div>
                        {/* <div className="text-[9px] px-1.5 py-0.5 border border-black rounded">
                                {weight}
                            </div> */}
                    </div>
                </div>
            </div>

        );
    }
);

ShippingLabel.displayName = "ShippingLabel";

function BarcodeStrip({ value }: { value: string }) {
    const bars: { x: number; w: number }[] = [];
    let x = 0;
    for (let i = 0; i < value.length * 4 + 20; i++) {
        const w = i % 3 === 0 ? 3 : i % 3 === 1 ? 1 : 2;
        if (i % 2 === 0) bars.push({ x, w });
        x += w + 1;
    }
    return (
        <svg
            width="130"
            height="32"
            viewBox={`0 0 ${x} 30`}
            preserveAspectRatio="none"
            className="block ml-auto"
        >
            {bars.map((b, i) => (
                <rect key={i} x={b.x} y={1} width={b.w} height={28} fill="#111" />
            ))}
        </svg>
    );
}

function QRBlock({ seed }: { seed: string }) {
    const size = 7;
    const cell = 9;
    const pad = 2;
    const hash = (r: number, c: number) => {
        let h = 0;
        for (let i = 0; i < seed.length; i++)
            h = (h * 31 + seed.charCodeAt(i)) & 0xffff;
        return ((h + r * 13 + c * 7) ^ (r + c * 11)) % 3;
    };
    const cells: React.ReactNode[] = [];
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const isCorner =
                (r < 2 && c < 2) ||
                (r < 2 && c >= size - 2) ||
                (r >= size - 2 && c < 2);
            if (isCorner || hash(r, c) === 0) {
                cells.push(
                    <rect
                        key={`${r}-${c}`}
                        x={pad + c * cell}
                        y={pad + r * cell}
                        width={cell - 1}
                        height={cell - 1}
                        fill="#111"
                    />
                );
            }
        }
    }
    return (
        <svg
            width={pad * 2 + size * cell}
            height={pad * 2 + size * cell}
            viewBox={`0 0 ${pad * 2 + size * cell} ${pad * 2 + size * cell}`}
        >
            {cells}
        </svg>
    );
}

export default ShippingLabel;