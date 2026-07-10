import { useMemo, useState } from "react";
import { createProduct, updateProduct } from "@/services/products/productServices";
import ProductGalleryUpload from "./ProductGalleryUpload";
import { Button } from "..";
import { Trash2, Plus, Minus, GripVertical } from "lucide-react";
import { destroyImage } from "@/services/contents/imageHandler";
import { toast } from "sonner";

const emptyVariantGroup = () => ({
  variantType: "color",
  variants: [{ variantData: "" }],
});

export default function ProductForm({ product = null, currentUserId = "" }) {
  const isEditMode = !!product?.serialNumber;

  const initialFormData = useMemo(
    () => ({
      author: product?.author || currentUserId || "",
      name: product?.name || "",
      serialNumber: product?.serialNumber || "",
      productId: product?.productId || "",
      family: product?.family || "NO-FAMILLY",
      isEcommerce: product?.isEcommerce || false,
      isActive: product?.isActive ?? true,
      tags: Array.isArray(product?.tags) ? product.tags.join(", ") : "",
      prices: {
        productPrice: product?.prices?.productPrice ?? 1509,
        shippingPrice: product?.prices?.shippingPrice ?? 800,
      },
      productVariants:
        Array.isArray(product?.productVariants) && product.productVariants.length > 0
          ? product.productVariants.map((v) => ({
              variantType: v.variantType || "color",
              variants:
                Array.isArray(v.variants) && v.variants.length > 0
                  ? v.variants.map((x) => ({ variantData: x.variantData || "" }))
                  : [{ variantData: "" }],
            }))
          : [],
    }),
    [product, currentUserId]
  );

  const [formData, setFormData] = useState(initialFormData);
  const [gallery, setGallery] = useState(product?.gallery || []);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "productPrice" || name === "shippingPrice"
        ? {
            prices: {
              ...prev.prices,
              [name]: value === "" ? 0 : Number(value),
            },
          }
        : {}),
    }));
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      prices: {
        ...prev.prices,
        [name]: value === "" ? 0 : Number(value),
      },
    }));
  };

  const addVariantGroup = () => {
    setFormData((prev) => ({
      ...prev,
      productVariants: [...prev.productVariants, emptyVariantGroup()],
    }));
  };

  const removeVariantGroup = (groupIndex) => {
    setFormData((prev) => ({
      ...prev,
      productVariants: prev.productVariants.filter((_, idx) => idx !== groupIndex),
    }));
  };

  const updateVariantGroupType = (groupIndex, value) => {
    setFormData((prev) => {
      const next = [...prev.productVariants];
      next[groupIndex].variantType = value;
      return { ...prev, productVariants: next };
    });
  };

  const addVariantValue = (groupIndex) => {
    setFormData((prev) => {
      const next = [...prev.productVariants];
      next[groupIndex].variants.push({ variantData: "" });
      return { ...prev, productVariants: next };
    });
  };

  const removeVariantValue = (groupIndex, valueIndex) => {
    setFormData((prev) => {
      const next = [...prev.productVariants];
      next[groupIndex].variants = next[groupIndex].variants.filter((_, idx) => idx !== valueIndex);

      if (next[groupIndex].variants.length === 0) {
        next[groupIndex].variants = [{ variantData: "" }];
      }

      return { ...prev, productVariants: next };
    });
  };

  const updateVariantValue = (groupIndex, valueIndex, value) => {
    setFormData((prev) => {
      const next = [...prev.productVariants];
      next[groupIndex].variants[valueIndex].variantData = value;
      return { ...prev, productVariants: next };
    });
  };

  async function updateProductFunc(payload) {
    await updateProduct(product.serialNumber, payload);
    toast.success(`Product "${payload.name}" has been updated!`);
  }

  async function createProductFunc(payload) {
    await createProduct(payload);

    toast.success(`Product "${payload.name}" has been created!`);

    setFormData((prev) => ({
      ...prev,
      name: "",
      serialNumber: "",
      productId: "",
      family: "NO-FAMILLY",
      tags: "",
      isActive: true,
      prices: { productPrice: 1509, shippingPrice: 800 },
      productVariants: [],
    }));
    setGallery([]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        productVariants: formData.productVariants
          .map((group) => ({
            variantType: group.variantType?.trim() || "color",
            variants: (group.variants || [])
              .map((v) => ({ variantData: v.variantData?.trim() || "" }))
              .filter((v) => v.variantData),
          }))
          .filter((group) => group.variants.length > 0),
        gallery,
        prices: {
          productPrice: Number(formData.prices.productPrice) || 0,
          shippingPrice: Number(formData.prices.shippingPrice) || 0,
        },
      };

      if (!payload.author) {
        toast.error("Author is required.");
        return;
      }

      if (isEditMode) {
        await updateProductFunc(payload);
      } else {
        await createProductFunc(payload);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while saving the product.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteImageFromGallery(imageUrl) {
    try {
      setLoading(true);
      await destroyImage(imageUrl);
      setGallery((prev) => prev.filter((element) => element !== imageUrl));
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete image.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full bg-white p-8 rounded-xl shadow-sm border border-slate-100">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Author</label>
            <input
              name="author"
              required
              className="border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-black outline-none transition-all"
              placeholder="User ID / Admin ID"
              value={formData.author}
              onChange={handleChange}
              readOnly={!!currentUserId}
            />
          </div>

          <div className="flex flex-col gap-1.5">
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
            <label className="text-sm font-semibold text-slate-700">Serial Number</label>
            <input
              name="serialNumber"
              required={!isEditMode}
              disabled={isEditMode}
              className="border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-black outline-none transition-all disabled:cursor-not-allowed"
              placeholder="SN-2025-001"
              value={formData.serialNumber}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">SKU / Product ID</label>
            <input
              name="productId"
              required
              className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black outline-none transition-all"
              placeholder="SM19"
              value={formData.productId}
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

          <div className="flex items-center gap-3 pt-6">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300"
            />
            <label htmlFor="isActive" className="text-sm font-semibold text-slate-700">
              Active product
            </label>
            <input
              id="isEcommerce"
              name="isEcommerce"
              type="checkbox"
              checked={formData.isEcommerce}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300"
            />
            <label htmlFor="isActive" className="text-sm font-semibold text-slate-700">
              For E-commerce?
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Product Price</label>
            <input
              name="productPrice"
              type="number"
              min="0"
              className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black outline-none transition-all"
              placeholder="1509"
              value={formData.prices.productPrice}
              onChange={handlePriceChange}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Shipping Price</label>
            <input
              name="shippingPrice"
              type="number"
              min="0"
              className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black outline-none transition-all"
              placeholder="800"
              value={formData.prices.shippingPrice}
              onChange={handlePriceChange}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">Tags</label>
          <input
            name="tags"
            className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black outline-none transition-all"
            placeholder="100% ALUMINIUM, Premium, Durable"
            value={formData.tags}
            onChange={handleChange}
          />
        </div>

        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-slate-700 block">
              Product Variants
            </label>

            <Button
              type="button"
              onClick={addVariantGroup}
              className="px-3 py-2 bg-black text-white rounded-lg text-sm flex items-center gap-2"
            >
              <Plus size={14} />
              Add Variant Group
            </Button>
          </div>

          <div className="space-y-4">
            {formData.productVariants.length === 0 ? (
              <div className="text-sm text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-lg p-4">
                No variants added yet.
              </div>
            ) : (
              formData.productVariants.map((group, groupIndex) => (
                <div
                  key={groupIndex}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <GripVertical size={16} className="text-slate-400" />
                      <input
                        value={group.variantType}
                        onChange={(e) => updateVariantGroupType(groupIndex, e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black outline-none transition-all bg-white"
                        placeholder="Variant type (color, size, material...)"
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={() => removeVariantGroup(groupIndex)}
                      className="p-2 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-lg transition-colors duration-200"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {group.variants.map((variant, valueIndex) => (
                      <div key={valueIndex} className="flex items-center gap-2">
                        <input
                          value={variant.variantData}
                          onChange={(e) =>
                            updateVariantValue(groupIndex, valueIndex, e.target.value)
                          }
                          className="flex-1 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black outline-none transition-all bg-white"
                          placeholder="Variant value"
                        />
                        <Button
                          type="button"
                          onClick={() => removeVariantValue(groupIndex, valueIndex)}
                          className="p-2 text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                        >
                          <Minus size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    onClick={() => addVariantValue(groupIndex)}
                    className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-100"
                  >
                    <Plus size={14} />
                    Add Value
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <label className="text-sm font-semibold text-slate-700 block mb-3">Product Media</label>

          <div className="bg-slate-50 w-full flex-col gap-2 justify-between flex p-4 rounded-lg border border-dashed border-slate-300">
            <ProductGalleryUpload setGallery={setGallery} />

            <div className="grid w-full gap-4 md:grid-cols-3 lg:grid-cols-4 max-md:grid-cols-2 justify-center items-center">
              {gallery.map((img, idx) => (
                <div
                  key={idx}
                  className="w-[70%] mx-auto cursor-pointer overflow-hidden hover:bg-purple-200/60 rounded-2xl relative border border-purple-200"
                >
                  <div className="absolute right-0">
                    <Button
                      onClick={() => deleteImageFromGallery(img)}
                      type="button"
                      className="p-3 m-2"
                      variant="destructive"
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
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
          {loading
            ? "Processing..."
            : isEditMode
              ? "Update Product"
              : "Create Product"}
        </Button>
      </form>
    </div>
  );
}