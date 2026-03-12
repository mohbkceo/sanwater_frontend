import { uploadImage } from "@/services/contents/imageHandler";
import { useRef } from "react";
import { Button } from "..";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";

export default function ProductGalleryUpload({ setGallery }) {
    const inputRef = useRef();
    const [loading, setLoading] = useState(false);

    async function handleUpload(e) {
        try {
            setLoading(true)
            const file = e.target.files[0];
            const res = await uploadImage(file);
            setGallery(prev => [...prev, res.data.path]);
        } catch (error) {
            console.log(error)
        } finally { 
            setLoading(false)
        }
    }

    return (
        <div className={cn("", loading && 'opacity-50')}>

            <Button  disabled={loading} type='button' onClick={() => inputRef.current.click()} variant={'outline'}>
                {loading ? <span className="flex justify-center items-center"> <Loader size={18} className="animate-spin" /> Procesing </span> : "Upload Image"}
            </Button>
            <input
                hidden
                ref={inputRef}
                type="file"
                onChange={handleUpload}
            />



        </div>
    );
}