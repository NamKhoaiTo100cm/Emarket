import { apiFetch } from "@/lib/api"

export const bannerService = {
  getActiveBanners: () => {
    return apiFetch('/banner', {}, true);
  },

  getAllBannersAdmin: () => {
    return apiFetch('/banner/admin');
  },

  createBanner: (formData: FormData) => {
    return apiFetch('/banner', {
      method: 'POST',
      body: formData,
    });
  },

  updateBanner: (id: number, formData: FormData) => {
    return apiFetch(`/banner/${id}`, {
      method: 'PATCH',
      body: formData,
    });
  },

  deleteBanner: (id: number) => {
    return apiFetch(`/banner/${id}`, {
      method: 'DELETE',
    });
  },
}
