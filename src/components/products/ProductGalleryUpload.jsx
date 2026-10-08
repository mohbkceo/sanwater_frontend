import { useTranslation } from "@/lib/i18n";
import { uploadImage } from "@/services/contents/imageHandler";
import { useRef } from "react";
import { Button } from "..";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
import { toast } from "sonner";

export default function ProductGalleryUpload({ setGallery }) {
  const { t } = useTranslation();
    const inputRef = useRef();
    const [loading, setLoading] = useState(false);

    async function handleUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setLoading(true)
            const res = await uploadImage(file);
            if (!res?.data?.path) throw new Error("Upload did not return an image URL");
            setGallery(prev => [...prev, res.data.path]);
        } catch (error) {
            toast.error(error?.response?.data?.message || t("admin.products.image_upload_failed"));
        } finally { 
            setLoading(false)
            e.target.value = "";
        }
    }

    return (
        <div className={cn("", loading && 'opacity-50')}>

            <Button  disabled={loading} type='button' onClick={() => inputRef.current.click()} variant={'outline'}>
                {loading ? <span className="flex justify-center items-center"> <Loader size={18} className="animate-spin" /> {t("admin.products.procesing")} </span> : t("admin.products.upload_image")}
            </Button>
            <input
                hidden
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
            />



        </div>
    );
}
