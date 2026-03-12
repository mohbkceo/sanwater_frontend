import { contentAPI } from "../baseAPIs"

export const destroyImage =async (imageUrl) => {
    try {
       const res = await contentAPI.delete(`/destroy/image/v1?imageURL=${imageUrl}`)
       return res.data;
    } catch (error) {
        console.log(error)
    }
}

export const uploadImage = async (file) => {
    const form = new FormData();
    form.append("image", file);

    const res = await contentAPI.post("/upload/image/v1", form);

    return res.data;
};