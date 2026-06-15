"use client"
import CarouselWithThumbs from '@/components/carousel-09';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircleIcon, Camera, HdIcon, Icon, MessagesSquare, ShoppingCart, Star, StarHalf, Store, X, Zap } from 'lucide-react';
import { RxAvatar } from "react-icons/rx";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { useCartStore } from '@/stores/useCartStore';
import { ProductItems, ProductVariant } from '@/types/product';
import { useParams, useRouter } from 'next/navigation';
import { useProductDetail } from '@/components/hooks/useProduct';
import { useEffect, useState } from 'react';
import { getProduct } from '@/actions/product.action';
import Image from 'next/image';
import { useShop, useShops } from '@/components/hooks/useShop';
import { useCheckoutStore } from '@/stores/useCheckoutStore';
import { Skeleton } from '@/components/ui/skeleton';
import SkeletonProductDetail from './loading';
import { reviewService } from '@/services/review.service';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Field } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import ChatButton from '@/components/chat-button';
import { useMe } from '@/components/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import VerifiedBadge from '@/components/ui/verified-badge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ReportButton from '@/components/ui/report-button';


const ProductDetailPage = () => {
  const router = useRouter();
  const addToCart = useCartStore(state => state.addToCart);
  const setCheckoutData = useCheckoutStore(state => state.setCheckoutData)


  const [productItem, setProductItem] = useState<ProductItems>(
    { id: 10, name: "Iphone 17 Pro max", soldCount: 10, reviewCount: 20, price: 30000000, description: "Iphone 17 Pro max là mẫu smartphone cao cấp mới nhất của Apple, mang đến sự kết hợp hoàn hảo giữa hiệu năng mạnh mẽ, thiết kế sang trọng và công nghệ tiên tiến. Máy được trang bị chip A-series thế hệ mới cho tốc độ xử lý vượt trội, đáp ứng mượt mà mọi nhu cầu từ công việc đến giải trí nặng như chơi game hay chỉnh sửa video. Thiết bị sở hữu màn hình OLED cao cấp với tần số quét 120Hz, cho trải nghiệm hiển thị cực kỳ mượt mà, màu sắc sống động và độ sáng cao, dễ dàng sử dụng trong mọi điều kiện ánh sáng. Hệ thống camera được nâng cấp toàn diện với độ phân giải cao, khả năng zoom quang học cải tiến và công nghệ xử lý hình ảnh thông minh, giúp người dùng chụp ảnh và quay video chất lượng chuyên nghiệp. iPhone 17 Pro Max còn nổi bật với thời lượng pin ấn tượng, hỗ trợ sạc nhanh và sạc không dây tiện lợi, đảm bảo sử dụng liên tục suốt cả ngày dài. Thiết kế khung titan cao cấp không chỉ mang lại vẻ ngoài sang trọng mà còn tăng độ bền, chống va đập và chống nước hiệu quả. Bên cạnh đó, các tính năng trí tuệ nhân tạo được tích hợp giúp tối ưu hiệu năng, cải thiện trải nghiệm người dùng và cá nhân hóa theo thói quen sử dụng. iPhone 17 Pro Max không chỉ là một chiếc điện thoại mà còn là công cụ toàn diện phục vụ cho công việc, sáng tạo và giải trí đỉnh cao.", salePrice: 27000000, stock: 10, ranking: 4.5, shopId: 1 });
  const productId = useParams().id;
  const { data: productData, isLoading, isError } = useProductDetail(Number(productId));
  const { data: userData } = useMe();
  const userRole = userData?.data?.role;
  const { data: shopData, isLoading: isShopLoading } = useShop(productData?.shopId, !isLoading);
  const [orderIdCanReview, setOrderIdCanReview] = useState<any>();
  const [quantity, setQuantiy] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);


  const productSpecs = [
    {
      specsId: "spec1",
      specsName: "Màn hình",
      specsValue: "Renina 2.5k",
    },
    {
      specsId: "spec2",
      specsName: "CPU",
      specsValue: "Intel Core i7-12700H",
    },
    {
      specsId: "spec3",
      specsName: "RAM",
      specsValue: "16GB",
    },
    {
      specsId: "spec4",
      specsName: "Ổ cứng",
      specsValue: "512GB",
    },
    {
      specsId: "spec5",
      specsName: "CPU",
      specsValue: "A19pro",
    },
    {
      specsId: "spec6",
      specsName: "Hệ điều hành",
      specsValue: "IOS26",

    }
  ]

  const fakeReviews = [
    {
      id: "r1",
      name: "Nguyễn Văn A",
      rating: 5,
      date: "15/04/2026",
      content: "Sản phẩm rất tốt, dùng mượt, pin trâu. Đáng tiền."
    },
    {
      id: "r2",
      name: "Trần Thị B",
      rating: 4.5,
      date: "14/04/2026",
      content: "Camera đẹp, chụp đêm ổn. Nhưng giá hơi cao."
    },
    {
      id: "r3",
      name: "Lê Văn C",
      rating: 4,
      date: "13/04/2026",
      content: "Hiệu năng mạnh, chơi game ngon. Máy hơi nóng khi dùng lâu."
    },
    {
      id: "r4",
      name: "Phạm Thị D",
      rating: 5,
      date: "12/04/2026",
      content: "Thiết kế đẹp, sang xịn. Giao hàng nhanh, đóng gói kỹ."
    },
    {
      id: "r5",
      name: "Hoàng Văn E",
      rating: 3.5,
      date: "11/04/2026",
      content: "Ổn trong tầm giá, nhưng mong pin tốt hơn."
    },
    {
      id: "r6",
      name: "Đỗ Thị F",
      rating: 4.8,
      date: "10/04/2026",
      content: "Màn hình đẹp, mượt. Xem phim rất đã."
    },
    {
      id: "r7",
      name: "Bùi Văn G",
      rating: 5,
      date: "09/04/2026",
      content: "Quá ngon, không có gì để chê."
    },
    {
      id: "r8",
      name: "Vũ Thị H",
      rating: 4.2,
      date: "08/04/2026",
      content: "Dùng ổn định, ít lỗi. Giá hơi chát nhưng đáng."
    },

  ];
  const [reviews, setReviews] = useState([]);
  // store selected star
  const [selectedStar, setSelectedStar] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const [hoverStarPosition, setHoverStarPosition] = useState(0);
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const getProductReview = async (productId: number) => {
    await reviewService.getByProductId(productId).then((res) => {
      setReviews(res.data.reviews);
      setOrderIdCanReview(res.data.reviewableOrder?.id);
    });
  }
  useEffect(() => {
    if (productData) {
      const newItem = {
        id: Number(productData.id),
        name: productData.name,
        price: Number(productData.price),
        soldCount: Number(productData.soldCount),
        reviewCount: Number(productData.reviewCount),
        description: productData.description,
        salePrice: Number(productData.salePrice),
        ranking: Number(productData.rating),
        stock: Number(productData.stock),
        shopId: Number(productData.shopId),
        variants: productData.variants ?? [],
      };
      setProductItem(newItem);
      setSelectedVariant(null); // reset khi đổi sản phẩm
    }
    getProductReview(Number(productId));
  }, [productData]);




  const productDescription: string = "iPhone 17 Pro Max là mẫu smartphone cao cấp mới nhất của Apple, mang đến sự kết hợp hoàn hảo giữa hiệu năng mạnh mẽ, thiết kế sang trọng và công nghệ tiên tiến. Máy được trang bị chip A-series thế hệ mới cho tốc độ xử lý vượt trội, đáp ứng mượt mà mọi nhu cầu từ công việc đến giải trí nặng như chơi game hay chỉnh sửa video. Thiết bị sở hữu màn hình OLED cao cấp với tần số quét 120Hz, cho trải nghiệm hiển thị cực kỳ mượt mà, màu sắc sống động và độ sáng cao, dễ dàng sử dụng trong mọi điều kiện ánh sáng. Hệ thống camera được nâng cấp toàn diện với độ phân giải cao, khả năng zoom quang học cải tiến và công nghệ xử lý hình ảnh thông minh, giúp người dùng chụp ảnh và quay video chất lượng chuyên nghiệp. iPhone 17 Pro Max còn nổi bật với thời lượng pin ấn tượng, hỗ trợ sạc nhanh và sạc không dây tiện lợi, đảm bảo sử dụng liên tục suốt cả ngày dài. Thiết kế khung titan cao cấp không chỉ mang lại vẻ ngoài sang trọng mà còn tăng độ bền, chống va đập và chống nước hiệu quả. Bên cạnh đó, các tính năng trí tuệ nhân tạo được tích hợp giúp tối ưu hiệu năng, cải thiện trải nghiệm người dùng và cá nhân hóa theo thói quen sử dụng. iPhone 17 Pro Max không chỉ là một chiếc điện thoại mà còn là công cụ toàn diện phục vụ cho công việc, sáng tạo và giải trí đỉnh cao.";

  if (isLoading || isShopLoading) {
    return <SkeletonProductDetail />
  }

  return (
    <div className='w-full mt-18 lg:px-20'>

      <div className='flex flex-col sm:flex-row'>
        {/* preview image product */}
        <div className='sm:w-1/2 flex justify-center'>
          <CarouselWithThumbs images={productData?.images?.map((image: { imageUrl: string }) => image.imageUrl) ?? []} />
        </div>
        {/* product info */}

        <div className='sm:w-1/2 outline-1'>
          {/* rating */}
          <div className='flex flex-wrap gap-2 items-center'>
            <div className="flex">
              {Array.from({ length: Math.floor(Number(productItem.ranking)) }).map((_, index) => (
                <Star className="mt-2 text-yellow-400 fill-yellow-400" key={index} />

              ))}
              {Number(productItem.ranking) % 1 != 0 && (<StarHalf className="mt-2 text-yellow-400 fill-yellow-400" />)}

            </div>
            <h1 className="mt-2">{Number(productItem.ranking)} ({productItem.reviewCount}) <a>reviews</a> | Đã bán {productItem.soldCount}</h1>
            <ReportButton type="product" targetId={productItem.id} className="ml-2 mt-1" />
          </div>
          {/* product name */}
          <div className='mt-5'>
            <h1 className='text-4xl font-bold'>{productItem.name}</h1>
          </div>

          {/* Variant selector */}
          {productItem.variants && productItem.variants.length > 0 && (
            <div className='mt-4'>
              <p className='text-sm font-medium text-muted-foreground mb-2'>Loại sản phẩm</p>
              <div className='flex flex-wrap gap-2'>
                {productItem.variants.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  const isOutOfStock = variant.stock <= 0;
                  return (
                    <button
                      key={variant.id}
                      disabled={isOutOfStock}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedVariant(null);
                        } else {
                          setSelectedVariant(variant);
                          setQuantiy(1);
                        }
                      }}
                      className={`
                        px-4 py-2 rounded-md border-2 text-sm font-medium transition-all duration-150
                        ${isOutOfStock ? 'opacity-40 cursor-not-allowed border-muted line-through' : 'cursor-pointer'}
                        ${isSelected
                          ? 'border-primary bg-primary text-primary-foreground shadow-md scale-105'
                          : 'border-border bg-background hover:border-primary hover:bg-primary/5'}
                      `}
                    >
                      {variant.name}
                      {isOutOfStock && <span className='ml-1 text-xs'>(hết)</span>}
                    </button>
                  );
                })}
              </div>
              {selectedVariant && (
                <p className='mt-2 text-xs text-muted-foreground'>
                  Đã chọn: <span className='font-semibold text-foreground'>{selectedVariant.name}</span>
                </p>
              )}
            </div>
          )}

          {/* price — hiển thị theo variant hoặc product */}
          <div className='mt-3 flex flex-wrap gap-2 items-end'>
            {(() => {
              const originalPrice = selectedVariant ? Number(selectedVariant.price) : Number(productItem.price);
              const salePrice = selectedVariant
                ? (selectedVariant.salePrice ? Number(selectedVariant.salePrice) : 0)
                : (productItem.salePrice ? Number(productItem.salePrice) : 0);

              const activePrice = salePrice > 0 && salePrice < originalPrice ? salePrice : originalPrice;
              const hasDiscount = salePrice > 0 && salePrice < originalPrice;

              return (
                <>
                  <h1 className='font-bold text-4xl'>
                    {activePrice.toLocaleString('vi-VN')} đ
                  </h1>
                  {hasDiscount && (
                    <>
                      <h1 className='text-2xl line-through text-muted-foreground'>{originalPrice.toLocaleString('vi-VN')} đ</h1>
                      <Badge className="p-3 bg-destructive text-sm">
                        -{Math.floor((originalPrice - activePrice) / originalPrice * 100)}%
                      </Badge>
                    </>
                  )}
                </>
              );
            })()}
          </div>


          <div className='mt-5 '>
            {/* choose quantities */}
            <div className='flex flex-wrap gap-2 items-center'>
              <h1>Số lượng</h1>
              {/* Nếu có variants mà chưa chọn thì disable quantity */}
              {(productItem.variants && productItem.variants.length > 0 && !selectedVariant) ? (
                <p className='text-sm text-muted-foreground italic'>Vui lòng chọn loại sản phẩm trước</p>
              ) : (
                <>
                  <div className='flex gap-1'>
                    <Button onClick={() =>
                      setQuantiy((prev) => {
                        const maxStock = selectedVariant ? selectedVariant.stock : productItem.stock;
                        return prev < maxStock ? prev + 1 : prev;
                      })
                    }>+</Button>
                    <Input min={1} value={quantity} type="number" className='w-15'
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        const maxStock = selectedVariant ? selectedVariant.stock : productItem.stock;
                        if (value < 1) { setQuantiy(1); return; }
                        if (value > maxStock) { setQuantiy(maxStock); return; }
                        setQuantiy(value);
                      }} />
                    <Button onClick={() => setQuantiy((prev) => (prev > 1 ? prev - 1 : 1))}>-</Button>
                  </div>
                  <h1>{(selectedVariant ? selectedVariant.stock : productItem.stock)} sản phẩm có sẵn</h1>
                </>
              )}
            </div>

          </div>
          {/* buy or add to cart buttons */}
          <div className='mt-5 flex flex-col sm:flex-row gap-2 '>
            {
              userRole === "staff" ? (<div>
                <Alert>
                  <AlertCircleIcon />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    Bạn không có quyền mua sản phẩm vì bạn là staff
                  </AlertDescription>
                </Alert>
              </div>) :
                <>

                  <Button className='p-5' onClick={() => {
                    if (productItem.variants && productItem.variants.length > 0 && !selectedVariant) {
                      toast.warning('Vui lòng chọn loại sản phẩm trước khi thêm vào giỏ hàng');
                      return;
                    }
                    const variantPrice = selectedVariant
                      ? (selectedVariant.salePrice && selectedVariant.salePrice > 0 ? Number(selectedVariant.salePrice) : Number(selectedVariant.price))
                      : undefined;
                    addToCart(
                      productItem.id,
                      selectedVariant ? { id: selectedVariant.id, name: selectedVariant.name, price: variantPrice! } : undefined
                    );
                  }}> <ShoppingCart />Thêm vào giỏ hàng</Button>
                  <Button className='p-5' variant={"destructive"} onClick={() => {
                    if (productItem.variants && productItem.variants.length > 0 && !selectedVariant) {
                      toast.warning('Vui lòng chọn loại sản phẩm');
                      return;
                    }
                    const activePrice = selectedVariant
                      ? (selectedVariant.salePrice && selectedVariant.salePrice > 0 ? selectedVariant.salePrice : selectedVariant.price)
                      : (productItem.salePrice && productItem.salePrice > 0 ? productItem.salePrice : productItem.price);
                    setCheckoutData([{
                      productId: productItem.id,
                      productName: productItem.name + (selectedVariant ? ` (${selectedVariant.name})` : ''),
                      quantity: quantity,
                      shopName: shopData?.name,
                      productImage: "",
                      shopId: productItem.shopId,
                      price: activePrice.toString(),
                      variantId: selectedVariant?.id,
                    }])
                    router.push("/checkout")
                  }} > <Zap />Mua ngay</Button>
                </>
            }
          </div>

        </div>

      </div>
      {/* Shop detail card */}
      <Card className='flex flex-col sm:flex-row mt-5 p-5 justify-between items-center'>
        <div className='flex gap-3 flex-row'>
          <Image
            src={shopData?.logo || "/shop-default-icon.svg"}
            alt="shop avatar"
            width={30}
            height={30}
            className='w-15 h-15 rounded-full object-cover border border-slate-100 dark:border-slate-800'
          />
          <div className='flex flex-col gap-1'>
            <h1 className='text-2xl font-bold flex items-center gap-2'>
              {shopData?.name}
              {shopData?.isVerified && <VerifiedBadge size="lg" showLabel />}
            </h1>
            <p>Xếp hạng: {shopData?.rating}</p>
            <p>Sản phẩm: {shopData?.productCount}</p>
          </div>
        </div>
        <div className='flex flex-row gap-2'>
          <Button onClick={() => router.push(`/shop-detail/${productItem.shopId}`)}><Store />View shop</Button>
          {/* <Button><MessagesSquare />Chat với shop</Button> */}
          <ChatButton shopId={productData?.shopId} />
        </div>
      </Card>
      {/* production specs */}
      {/* <h3 className='text-xl mt-3'>Thông số kỹ thuật</h3>
      <Table>
        <TableCaption>Thông số kỹ thuật có thể khác tùy phiên bản</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="">Thông số kỹ thuật</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productSpecs.map((spec, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{spec.specsName}</TableCell>
              <TableCell>{spec.specsValue}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table> */}

      {/* product description */}
      <h3 className='text-xl mt-5'>Mô tả sản phẩm</h3>
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {productItem.description}
        </ReactMarkdown>
      </div>

      {/* product reviews */}
      <h3 className='text-xl mt-5'>Đánh giá sản phẩm</h3>
      <Card className='flex w-full flex-col mb-3 px-3 items-center justify-center'>
        <CardTitle className='flex flex-col items-center gap-2'>
          <Star className="mt-1 w-24 h-24 text-9xl text-yellow-400 fill-yellow-400" />
          <h1>Đánh giá trung bình {productItem.ranking}</h1>
        </CardTitle>
      </Card>
      {/* add review */}
      <div>
        {orderIdCanReview && (
          <>
            <Field className='mt-3 flex gap-2'>
              <Label>Thêm đánh giá</Label>
              <Textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder='Nhập đánh giá'></Textarea>
            </Field>

            {/* Review images selector */}
            <div className="mt-3 mb-4">
              <Label className="block mb-2 font-medium">Hình ảnh sản phẩm (Tối đa 3 ảnh, không bắt buộc)</Label>
              <div className="flex flex-wrap gap-3 items-center">
                {reviewImages.map((file, idx) => {
                  const url = URL.createObjectURL(file);
                  return (
                    <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 group shadow-sm bg-slate-50">
                      <Image
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setReviewImages(prev => prev.filter((_, i) => i !== idx));
                        }}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-90 hover:opacity-100 hover:bg-black/80 transition-all shadow-md cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}

                {reviewImages.length < 3 && (
                  <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-primary/50 rounded-lg cursor-pointer transition-colors bg-slate-50 dark:bg-slate-900 hover:bg-slate-100">
                    <div className="flex flex-col items-center justify-center pt-2 pb-2 text-muted-foreground hover:text-foreground">
                      <Camera className="w-6 h-6 mb-1 text-slate-400" />
                      <span className="text-[10px] font-semibold">Tải ảnh</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) {
                          const filesArray = Array.from(e.target.files);
                          const totalFiles = reviewImages.length + filesArray.length;
                          if (totalFiles > 3) {
                            toast.error("Bạn chỉ được chọn tối đa 3 ảnh");
                            const allowedLength = 3 - reviewImages.length;
                            setReviewImages(prev => [...prev, ...filesArray.slice(0, allowedLength)]);
                          } else {
                            setReviewImages(prev => [...prev, ...filesArray]);
                          }
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className='flex items-center gap-2'>Chọn sao:
              {Array.from({ length: 5 }).map((_, index) => (
                <Star className={`mt-1 cursor-pointer ${index < (hoverStarPosition || selectedStar) ? 'text-yellow-400 fill-yellow-400' : 'text-yellow-400'}`} onMouseEnter={() => setHoverStarPosition(index + 1)} onMouseLeave={() => setHoverStarPosition(0)} onClick={() => setSelectedStar(index + 1)} key={index} />
              ))}
            </div><Button className='mt-3' onClick={() => {
              if (selectedStar == 0) {
                toast.error("Vui lòng chọn số sao", {
                  description: "Please select a star rating",
                })
                return;
              }
              if (reviewText === "") {
                toast.error("Vui lòng nhập đánh giá", {
                  description: "Please enter a review",
                })
                return;
              }

              const formData = new FormData();
              formData.append('productId', String(productId));
              formData.append('rating', String(selectedStar));
              formData.append('comment', reviewText);
              formData.append('isHidden', 'false');
              formData.append('orderId', String(orderIdCanReview));
              reviewImages.forEach((file) => {
                formData.append('reviewImages', file);
              });

              reviewService.create(formData).then((res) => {
                console.log(res);
                getProductReview(Number(productId));
                setReviewText("");
                setSelectedStar(0);
                setHoverStarPosition(0);
                setReviewImages([]);
              });
            }}>Thêm đánh giá</Button>
          </>
        )
        }
      </div>

      <div className='mt-3 flex flex-wrap gap-2'>
        <p>Lọc đánh giá:</p>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Lọc đánh giá" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="5">5 sao</SelectItem>
            <SelectItem value="4">4 sao</SelectItem>
            <SelectItem value="3">3 sao</SelectItem>
            <SelectItem value="2">2 sao</SelectItem>
            <SelectItem value="1">1 sao</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {reviews && reviews.length > 0 ? reviews?.map((review: any) => (
        <Card className='flex flex-row mb-3 px-3 py-3 justify-between items-start' key={review.id}>
          <div className="flex flex-row gap-3">
            <RxAvatar className='w-8 h-8 shrink-0' />
            <div>
              <CardTitle className='flex items-center gap-2'>
                <p>{review.user.name}</p>
                <div className='flex flex-warp'>
                  {Array.from({ length: Math.floor(review.rating) }).map((_, index) => (
                    <Star className="mt-1 text-yellow-400 fill-yellow-400" key={index} />

                  ))}
                  {review.rating % 1 != 0 && (<StarHalf className="mt-1 text-yellow-400 fill-yellow-400" />)}
                </div>

                <div>{new Date(review.createdAt).toLocaleDateString()}</div>
              </CardTitle>
              <CardDescription className="mt-1">
                <p>{review.comment}</p>
              </CardDescription>
              {review.reviewImages && review.reviewImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {review.reviewImages.map((imgUrl: string, idx: number) => (
                    <div 
                      key={idx} 
                      className="relative w-16 h-16 rounded-md overflow-hidden border border-slate-200 dark:border-slate-800 cursor-zoom-in group transition-transform duration-200 hover:scale-105"
                      onClick={() => setPreviewImageUrl(imgUrl)}
                    >
                      <Image 
                        src={imgUrl} 
                        alt={`Review image ${idx + 1}`} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <ReportButton type="review" targetId={review.id} variant="icon" className="shrink-0" />
        </Card>
      ))
        : <p>Chưa có đánh giá</p>
      }
      <Button className='block mx-auto my-3'>Tải thêm đánh giá</Button>

      {previewImageUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div className="relative max-w-3xl max-h-[80vh] overflow-hidden rounded-lg bg-background p-1 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors cursor-pointer"
              onClick={() => setPreviewImageUrl(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative w-96 h-96 max-w-full max-h-full min-w-[300px] md:min-w-[500px] md:min-h-[500px]">
              <Image 
                src={previewImageUrl} 
                alt="Full size review image" 
                fill 
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>


  )
}

export default ProductDetailPage;