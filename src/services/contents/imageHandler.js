import { contentAPI } from "../baseAPIs"

export const destroyImage =async (imageUrl) => {
    try {
       const res = await contentAPI.delete(`/destroy/image/v1`, { params: { imageURL: imageUrl } })
       return res.data;
    } catch (error) {
        console.log(error)
    }
}

export const uploadImage = async (file, { folder = "content", onProgress } = {}) => {
    const form = new FormData();
    form.append("image", file);

    const res = await contentAPI.post("/upload/image/v1", form, {
      params: { folder },
      onUploadProgress: (event) => onProgress?.(event.total ? Math.round((event.loaded / event.total) * 100) : 0),
    });

    return res.data;
};
