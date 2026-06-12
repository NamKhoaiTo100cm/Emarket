"use client";

import { useEffect, useState, useRef } from "react";
import { bannerService } from "@/services/banner.service";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PlusIcon, Edit, Trash2, Globe, Power, ImageIcon, LinkIcon } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";
import Image from "next/image";

interface Banner {
  id: number;
  title: string | null;
  image: string;
  imageUrl: string;
  link: string | null;
  position: "main" | "sub" | "popup";
  sortOrder: number;
  active: boolean;
}

export default function BannersManagerPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Single consolidated Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedBannerId, setSelectedBannerId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    link: "",
    position: "main" as "main" | "sub" | "popup",
    sortOrder: 0,
    active: true,
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch banners
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await bannerService.getAllBannersAdmin();
      setBanners(res.data || []);
    } catch (err: any) {
      toast.error("Lỗi khi tải danh sách banner: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  // Open Dialog for Create
  const openCreateDialog = () => {
    setMode("create");
    setSelectedBannerId(null);
    setFormData({
      title: "",
      link: "",
      position: "main",
      sortOrder: 0,
      active: true,
    });
    setFile(null);
    setPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setDialogOpen(true);
  };

  // Open Dialog for Edit
  const openEditDialog = (banner: Banner) => {
    setMode("edit");
    setSelectedBannerId(banner.id);
    setFormData({
      title: banner.title || "",
      link: banner.link || "",
      position: banner.position,
      sortOrder: banner.sortOrder,
      active: banner.active,
    });
    setFile(null);
    setPreview(banner.imageUrl);
    setDialogOpen(true);
  };

  // Form Submit handler for both Create and Edit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "create" && !file) {
      toast.error("Vui lòng chọn ảnh banner");
      return;
    }

    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("link", formData.link);
    submitData.append("position", formData.position);
    submitData.append("sortOrder", formData.sortOrder.toString());
    submitData.append("active", formData.active.toString());

    if (file) {
      submitData.append("imageFile", file);
    }

    try {
      if (mode === "create") {
        await bannerService.createBanner(submitData);
        toast.success("Tạo banner thành công");
      } else if (mode === "edit" && selectedBannerId !== null) {
        await bannerService.updateBanner(selectedBannerId, submitData);
        toast.success("Cập nhật banner thành công");
      }
      setDialogOpen(false);
      fetchBanners();
    } catch (err: any) {
      toast.error(err.message || (mode === "create" ? "Tạo banner thất bại" : "Cập nhật banner thất bại"));
    }
  };

  // Quick toggle active status from table
  const handleToggleActive = async (banner: Banner) => {
    const submitData = new FormData();
    submitData.append("active", (!banner.active).toString());

    try {
      await bannerService.updateBanner(banner.id, submitData);
      toast.success(`Đã ${!banner.active ? "kích hoạt" : "hủy kích hoạt"} banner`);

      // Optimistic update
      setBanners(prev =>
        prev.map(b => (b.id === banner.id ? { ...b, active: !b.active } : b))
      );
    } catch (err: any) {
      toast.error("Không thể thay đổi trạng thái banner");
    }
  };

  // Delete Banner
  const handleDeleteBanner = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa banner này?")) return;

    try {
      await bannerService.deleteBanner(id);
      toast.success("Xóa banner thành công");
      fetchBanners();
    } catch (err: any) {
      toast.error(err.message || "Xóa banner thất bại");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-card/50 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800/80 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-800 dark:text-zinc-100">
            Quản lý Banner
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Thiết lập banner quảng cáo, sự kiện hiển thị trên trang chủ
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-md flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" /> Tạo banner mới
        </Button>
      </div>

      {/* Tables list */}
      <div className="bg-white dark:bg-card/50 rounded-2xl border border-gray-100 dark:border-zinc-800/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-500">Đang tải danh sách banner...</div>
        ) : banners.length === 0 ? (
          <div className="py-20 text-center text-gray-500">Chưa có banner nào được tạo. Hãy nhấn "Tạo banner mới"!</div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-zinc-900/50">
              <TableRow>
                <TableHead className="w-32">Hình ảnh</TableHead>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Liên kết</TableHead>
                <TableHead className="w-32">Vị trí</TableHead>
                <TableHead className="w-28 text-center">Thứ tự</TableHead>
                <TableHead className="w-36 text-center">Trạng thái</TableHead>
                <TableHead className="w-28 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner) => (
                <TableRow key={banner.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                  <TableCell>
                    <div className="relative w-24 h-12 rounded-lg overflow-hidden border border-gray-100 dark:border-zinc-800 shadow-sm">
                      <Image
                        src={banner.imageUrl}
                        alt={banner.title || "Banner Image"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-gray-800 dark:text-zinc-100">
                    {banner.title || <span className="text-gray-400 dark:text-zinc-600 italic">Không có tiêu đề</span>}
                  </TableCell>
                  <TableCell>
                    {banner.link ? (
                      <a
                        href={banner.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-orange-500 hover:text-orange-600 hover:underline flex items-center gap-1.5 max-w-[200px] truncate"
                      >
                        <Globe className="w-3.5 h-3.5 shrink-0" />
                        {banner.link}
                      </a>
                    ) : (
                      <span className="text-gray-400 dark:text-zinc-600 italic">Không có link</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${banner.position === "main"
                      ? "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
                      : banner.position === "sub"
                        ? "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
                        : "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                      }`}>
                      {banner.position === "main" ? "Chính (Slider)" : banner.position === "sub" ? "Phụ" : "Popup"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-semibold text-gray-700 dark:text-zinc-300">
                    {banner.sortOrder}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      onClick={() => handleToggleActive(banner)}
                      variant="ghost"
                      size="sm"
                      className={`rounded-full px-3 py-1 flex items-center gap-1.5 mx-auto ${banner.active
                        ? "bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 dark:bg-green-500/10 dark:text-green-400"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-600 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      {banner.active ? "Kích hoạt" : "Tạm ẩn"}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        onClick={() => openEditDialog(banner)}
                        size="icon"
                        variant="ghost"
                        className="w-8 h-8 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteBanner(banner.id)}
                        size="icon"
                        variant="ghost"
                        className="w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Shared Dialog (Reusable for Create & Edit) */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-zinc-950 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-zinc-100">
                {mode === "create" ? "Tạo banner mới" : "Chỉnh sửa banner"}
              </DialogTitle>
              <DialogDescription>
                {mode === "create"
                  ? "Thêm hình ảnh banner và thiết lập thông số hiển thị ở trang chủ."
                  : "Thay đổi hình ảnh hoặc thông tin cấu hình cho banner này."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-5 max-h-[50vh] overflow-y-auto pr-2">
              <Field className="col-span-2">
                <Label htmlFor="banner-image" className="text-sm font-semibold flex items-center gap-1.5 mb-1 text-gray-700 dark:text-zinc-300">
                  <ImageIcon className="w-4 h-4 text-orange-500" />
                  {mode === "create" ? "Hình ảnh Banner *" : "Hình ảnh Banner (Để trống nếu giữ nguyên)"}
                </Label>
                <div className="flex flex-col gap-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-zinc-900/20 transition-all group"
                  >
                    <PlusIcon className="w-8 h-8 text-gray-400 group-hover:text-orange-500 transition-colors" />
                    <span className="text-sm text-gray-600 dark:text-zinc-400 font-medium">
                      {mode === "create" ? "Nhấn để chọn tập tin ảnh" : "Nhấn để thay đổi tập tin ảnh"}
                    </span>
                    {mode === "create" && (
                      <span className="text-xs text-gray-400 dark:text-zinc-500">Hỗ trợ JPG, PNG, WEBP (Khuyên dùng tỷ lệ rộng)</span>
                    )}
                  </div>
                  <Input
                    type="file"
                    id="banner-image"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  {preview && (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-100 dark:border-zinc-800 shadow-sm mt-1">
                      <Image
                        src={preview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </Field>

              <Field className="col-span-2">
                <Label htmlFor="banner-title" className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Tiêu đề quảng cáo
                </Label>
                <Input
                  id="banner-title"
                  placeholder="Ví dụ: Siêu hội điện thoại"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="rounded-xl border-gray-200 dark:border-zinc-800"
                />
              </Field>

              <Field className="col-span-2">
                <Label htmlFor="banner-link" className="text-sm font-semibold flex items-center gap-1.5 text-gray-700 dark:text-zinc-300 mb-1">
                  <LinkIcon className="w-3.5 h-3.5 text-orange-500" /> Đường dẫn liên kết (khi click vào banner)
                </Label>
                <Input
                  id="banner-link"
                  placeholder="Ví dụ: /search?categorySlug=dien-thoai"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="rounded-xl border-gray-200 dark:border-zinc-800"
                />
              </Field>

              <Field>
                <Label htmlFor="banner-position" className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Vị trí hiển thị
                </Label>
                <Select
                  value={formData.position}
                  onValueChange={(val) => setFormData({ ...formData, position: val as any })}
                >
                  <SelectTrigger className="rounded-xl border-gray-200 dark:border-zinc-800">
                    <SelectValue placeholder="Chọn vị trí" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Chính (Slider Trang chủ)</SelectItem>
                    <SelectItem value="sub">Phụ (Hai bên/Dưới)</SelectItem>
                    <SelectItem value="popup">Popup Quảng Cáo</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <Label htmlFor="banner-sortOrder" className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Thứ tự hiển thị
                </Label>
                <Input
                  type="number"
                  id="banner-sortOrder"
                  placeholder="0"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                  className="rounded-xl border-gray-200 dark:border-zinc-800"
                />
              </Field>

              {mode === "edit" && (
                <Field className="col-span-2">
                  <Label htmlFor="banner-active" className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Kích hoạt hiển thị
                  </Label>
                  <Select
                    value={formData.active.toString()}
                    onValueChange={(val) => setFormData({ ...formData, active: val === "true" })}
                  >
                    <SelectTrigger className="rounded-xl border-gray-200 dark:border-zinc-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Bật (Hiển thị ngay)</SelectItem>
                      <SelectItem value="false">Tắt (Tạm ẩn)</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </div>

            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPreview("");
                    setFile(null);
                  }}
                >
                  Hủy bỏ
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {mode === "create" ? "Tạo banner" : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
