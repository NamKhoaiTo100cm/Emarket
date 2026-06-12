"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCartStore } from "@/stores/useCartStore";
import { GiConfirmed } from "react-icons/gi";

type ItemProps = {
  productId: number,
  productName: string,
  quantity: number,
  price: string,
}
type PaymentConfirmedProps = {
  userId: number,
  shopId: number,
  shippingAddress: string,
  receiverName: string,
  receiverPhone: string,
  paymentMethod: string,
  items: ItemProps[]
};

const PaymentConfirmed = () => {
  const productInCart = useCartStore(state => state.productItems);
  console.log(productInCart);
  return (
    <>
      <div className='p-2 mt-13.75 w-full min-h-screen'>
        <div className="mt-30 mx-10 md:mx-20 lg:mx-80 flex flex-col flex-wrap gap-2 items-center">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <GiConfirmed className="size-12" />
              <h1 className="text-2xl">Đặt hàng thành công</h1>
            </div>
            <h1 className="mt-2 overflow-auto text-center">Đơn hàng #575423 đã được đặt. Chúng tôi đã gửi cho bạn email tới địa chỉ nam@mail.com gồm có thông tin đặt hàng và hóa đơn. Nếu không nhận được email, kiểm tra hòm thư rác.</h1>

          </div>
        </div>
        <div className="mx-10 md:mx-20 lg:mx-50">
          <Card className="w-full gap-3">

            <CardHeader>
              Đơn hàng #575423
            </CardHeader>
            <CardContent>

              <div className="grid sm:grid-cols-2">
                <div>
                  <h1 className="font-semibold">Thông tin giao hàng</h1>
                  <div className="flex gap-1">
                    <h1>Họ và tên:</h1>
                    <h1>Nguyễn Sơn Nam</h1>
                  </div>
                  <div className="flex gap-1">
                    <h1>Email:</h1>
                    <h1>nam@mail.com</h1>
                  </div>
                  <div className="flex gap-1">
                    <h1>Điện thoại:</h1>
                    <h1>nam@mail.com</h1>
                  </div>
                  <div className="flex gap-1">
                    <h1>Địa chỉ giao hàng:</h1>
                    <h1>Quảng Ninh, Việt Nam</h1>
                  </div>
                </div>
                <div >
                  <h1 className="font-semibold">Thông tin đơn hàng</h1>
                  <div className="flex gap-1">
                    <h1>Mã đơn hàng:</h1>
                    <h1>#575423</h1>
                  </div>
                  <div className="flex gap-1">
                    <h1>Ngày đặt:</h1>
                    <h1>1/11/2025 7:00</h1>
                  </div>
                  <div className="flex gap-1">
                    <h1>Tổng tiền:</h1>
                    <h1>50.000.000 VND</h1>
                  </div>
                  <div className="flex gap-1">
                    <h1>Phương thức thanh toán:</h1>
                    <h1>Thanh toán khi nhận hàng</h1>
                  </div>
                </div>
              </div>
              <div>
                <h1 className="font-semibold mt-3">Sản phẩm đã đặt mua: </h1>
                <Table>
                  <TableCaption>Thông số có thể khác nhau tùy lựa chọn phiên bản</TableCaption>
                  <TableHeader>

                    <TableRow>
                      <TableHead className="w-55 md:w-72.5">Tên sản phẩm</TableHead>
                      <TableHead className="">Số lượng</TableHead>
                      <TableHead className="">Giá</TableHead>

                    </TableRow>
                  </TableHeader>
                  <TableBody>

                    {productInCart.map((item: any, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.name || item.variantName || `Sản phẩm #${item.id}`}</TableCell>
                        <TableCell className="">{item.quantity || 1}</TableCell>
                        <TableCell className="">{item.price || item.variantPrice || "0"}</TableCell>
                      </TableRow>
                    ))}

                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </>
  )
}

export default PaymentConfirmed