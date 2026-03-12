import { useState } from "react";
import { createProduct } from "@/services/products/productServices";
import ProductGalleryUpload from "./ProductGalleryUpload";
import { Button } from "..";
import { Trash } from "lucide-react";
import { Trash2 } from "lucide-react";
import { destroyImage } from "@/services/contents/imageHandler";

export default function ProductForm() {
  const [formData, setFormData] = useState({
    name: "",
    family: "",
    productId: "",
    tags: "",
  });
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(",").map((tag) => tag.trim()),
        gallery,
      };

      await createProduct(payload);
      
      setFormData(prv => ({...prv, productId: "" }));
      setGallery([]);
      alert("Product created successfully!");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteImageFromGallery(imageUrl){
    try {
      setLoading(true);
      await destroyImage(imageUrl);
      setGallery((prev) => {
        return prev.filter((element) => element != imageUrl);
      })
    } 
    catch (error) {
      console.error(error)
    } 
    finally{ 
      setLoading(false);
    }
  }

  return (
    <div className="w-full bg-white p-8 rounded-xl shadow-sm border border-slate-100">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Create New Product</h2>
        <p className="text-slate-500 text-sm">Fill in the details below to add a new item to your inventory.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Product Name</label>
            <input
              name="name"
              required
              className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black outline-none transition-all"
              placeholder="Douchettes D’ablution"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Serie / Family</label>
            <input
              name="family"
              className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black outline-none transition-all"
              placeholder="e.g. SM"
              value={formData.family}
              onChange={handleChange}
            />
          </div>

          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">SKU / Product ID</label>
            <input
              name="productId"
              className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black outline-none transition-all"
              placeholder="SM19"
              value={formData.productId}
              onChange={handleChange}
            />
          </div>
        </div>

        
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">Tags</label>
          <input
            name="tags"
            className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black outline-none transition-all"
            placeholder="100% ALUMINIUM (separate with ,)"
            value={formData.tags}
            onChange={handleChange}
          />
        </div>

        
        <div className="pt-4 border-t border-slate-100">
          <label className="text-sm font-semibold text-slate-700 block mb-3">Product Media</label>
          <div className="bg-slate-50 w-full flex-col gap-2 justify-between flex p-4 rounded-lg border border-dashed border-slate-300">
            <ProductGalleryUpload setGallery={setGallery} />
            <div className="grid  w-full  md:grid-cols-3 lg:gird-cols-4 max-md:gird-cols-2 justify-center items-center grid-cols-1 ">
                {gallery.map((img, idx) => ( 
                  <div key={idx} className="w-[70%] mx-auto  cursor-pointer overflow-hidden hover:bg-purple-200/60 rounded-2xl relative border border-purple-200">
                    <div className="absolute right-0"><Button onClick={() => deleteImageFromGallery(img)} type='button' className={`p-3 m-2`} variant={'destructive'}><Trash2 size={15} /></Button> </div>
                    <img className="object-cover w-full" src={img} alt="product_image" />
                  </div>
                 ))}
            </div>
          </div>

        </div>

        <Button
          type="submit"
          disabled={loading}
          className={`w-full py-3 bg-black text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Processing..." : "Create Product"}
        </Button>
      </form>
    </div>
  );
}