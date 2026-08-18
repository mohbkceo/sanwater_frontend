import { useEffect, useMemo, useState } from "react";
import { createProduct, updateProduct } from "@/services/products/productServices";
import { getCategories } from "@/services/products/categoryServices";
import { getCollections } from "@/services/products/collectionServices";
import ProductGalleryUpload from "./ProductGalleryUpload";
import { Button } from "..";
import { Trash2, Plus, Minus, GripVertical } from "lucide-react";
import { destroyImage } from "@/services/contents/imageHandler";
import { toast } from "sonner";

const emptyVariantGroup = () => ({
  variantType: "color",
  variants: [{ variantData: "" }],
});

const emptySpecification = () => ({ label: "", value: "" });
const emptyDocument = () => ({ title: "", type: "technical_sheet", url: "" });

const DOCUMENT_TYPES = [
  { value: "catalogue", label: "Catalogue" },
  { value: "technical_sheet", label: "Technical sheet" },
  { value: "installation_guide", label: "Installation guide" },
  { value: "warranty", label: "Warranty" },
  { value: "presentation", label: "Presentation" },
  { value: "other", label: "Other" },
];

// Flattens the category tree (as returned by GET /categories) into a flat
// option list, indenting subcategories so the hierarchy stays visible in a
// single <select>.
function flattenCategoryOptions(categories) {
  const options = [];
  (categories || []).forEach((cat) => {
    options.push({ value: cat._id, label: cat.name, depth: 0 });
    (cat.subcategories || []).forEach((sub) => {
      options.push({ value: sub._id, label: sub.name, depth: 1 });
    });
  });
  return options;
}

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

      // --- Catalog / digital-representation fields ---
      slug: product?.slug || "",
      status: product?.status || "draft",
      category: product?.category?._id || product?.category || "",
      subcategory: product?.subcategory?._id || product?.subcategory || "",
      collection: product?.collectionRef?._id || product?.collectionRef || "",
      shortDescription: product?.shortDescription || "",
      description: product?.description || "",
      material: product?.material || "",
      finishes: Array.isArray(product?.finishes) ? product.finishes.join(", ") : "",
      dimensions: product?.dimensions || "",
      installation: product?.installation || "",
      applications: Array.isArray(product?.applications) ? product.applications.join(", ") : "",
      specifications:
        Array.isArray(product?.specifications) && product.specifications.length > 0
          ? product.specifications
          : [],
      documents: Array.isArray(product?.documents) ? product.documents : [],
      seo: {
        title: product?.seo?.title || "",
        description: product?.seo?.description || "",
        canonicalUrl: product?.seo?.canonicalUrl || "",
        noIndex: product?.seo?.noIndex || false,
      },
    }),
    [product, currentUserId]
  );

  const [formData, setFormData] = useState(initialFormData);
  const [gallery, setGallery] = useState(product?.gallery || []);
  const [loading, setLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [collectionOptions, setCollectionOptions] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [categoriesRes, collectionsRes] = await Promise.all([
          getCategories({ isAdmin: true }),
          getCollections({ isAdmin: true }),
        ]);
        setCategoryOptions(flattenCategoryOptions(categoriesRes?.data?.categories));
        setCollectionOptions(collectionsRes?.data?.collections || []);
      } catch (error) {
        console.error("Failed to load categories/collections", error);
      }
    })();
  }, []);

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

  const handleSeoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      seo: { ...prev.seo, [name]: type === "checkbox" ? checked : value },
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

  const addSpecification = () => {
    setFormData((prev) => ({ ...prev, specifications: [...prev.specifications, emptySpecification()] }));
  };

  const updateSpecification = (index, key, value) => {
    setFormData((prev) => {
      const next = [...prev.specifications];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, specifications: next };
    });
  };

  const removeSpecification = (index) => {
    setFormData((prev) => ({ ...prev, specifications: prev.specifications.filter((_, i) => i !== index) }));
  };

  const addDocument = () => {
    setFormData((prev) => ({ ...prev, documents: [...prev.documents, emptyDocument()] }));
  };

  const updateDocument = (index, key, value) => {
    setFormData((prev) => {
      const next = [...prev.documents];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, documents: next };
    });
  };

  const removeDocument = (index) => {
    setFormData((prev) => ({ ...prev, documents: prev.documents.filter((_, i) => i !== index) }));
  };

  async function updateProductFunc(payload) {
    await updateProduct(product.serialNumber, payload);
    toast.success(`Product "${payload.name}" has been updated!`);
  }

  async function createProductFunc(payload) {
    await createProduct(payload);

    toast.success(`Product "${payload.name}" has been created!`);

    setFormData(initialFormData);
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
        finishes: formData.finishes
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
        applications: formData.applications
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
        specifications: formData.specifications.filter((s) => s.label?.trim() && s.value?.trim()),
        documents: formData.documents.filter((d) => d.title?.trim() && d.url?.trim()),
        category: formData.category || null,
        subcategory: formData.subcategory || null,
        collection: formData.collection || null,
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

      if (!payload.slug) delete payload.slug;

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

        {/* --- Catalog: category, collection, publication status --- */}
        <div className="pt-4 border-t border-slate-100">
          <label className="text-sm font-semibold text-slate-700 block mb-3">Catalog</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-black outline-none transition-all"
              >
                <option value="">Uncategorized</option>
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.depth > 0 ? `— ${opt.label}` : opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Collection</label>
              <select
                name="collection"
                value={formData.collection}
                onChange={handleChange}
                className="border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-black outline-none transition-all"
              >
                <option value="">No collection</option>
                {collectionOptions.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Publication status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-black outline-none transition-all"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">
                URL slug {isEditMode ? "" : "(leave blank to auto-generate)"}
              </label>
              <input
                name="slug"
                className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black outline-none transition-all"
                placeholder="mitigeur-lavabo-sm19"
                value={formData.slug}
                onChange={handleChange}
              />
              {isEditMode && (
                <p className="text-xs text-amber-600">Changing this breaks the product's existing public URL.</p>
              )}
            </div>
          </div>
        </div>

        {/* --- Content --- */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <label className="text-sm font-semibold text-slate-700 block">Content</label>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-600">Short description</label>
            <textarea
              name="shortDescription"
              rows={2}
              maxLength={300}
              className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black outline-none transition-all"
              placeholder="One or two sentences shown in listings"
              value={formData.shortDescription}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-600">Full description</label>
            <textarea
              name="description"
              rows={5}
              className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black outline-none transition-all"
              placeholder="Detailed description shown on the product page"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* --- Technical --- */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <label className="text-sm font-semibold text-slate-700 block">Technical</label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-600">Material</label>
              <input
                name="material"
                className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black outline-none transition-all"
                placeholder="e.g. Aluminium"
                value={formData.material}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-600">Finishes</label>
              <input
                name="finishes"
                className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black outline-none transition-all"
                placeholder="Chromé, Noir mat"
                value={formData.finishes}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-600">Dimensions</label>
              <input
                name="dimensions"
                className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black outline-none transition-all"
                placeholder="e.g. 15 x 20 x 8 cm"
                value={formData.dimensions}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-600">Installation</label>
              <input
                name="installation"
                className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black outline-none transition-all"
                placeholder="e.g. Montage mural"
                value={formData.installation}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-600">Applications</label>
            <input
              name="applications"
              className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black outline-none transition-all"
              placeholder="Hôtellerie, Résidentiel, Commercial"
              value={formData.applications}
              onChange={handleChange}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-600">Specifications</label>
              <Button type="button" onClick={addSpecification} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs flex items-center gap-1 hover:bg-slate-100">
                <Plus size={12} /> Add
              </Button>
            </div>
            {formData.specifications.length === 0 ? (
              <div className="text-sm text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-lg p-3">
                No technical specifications added yet.
              </div>
            ) : (
              <div className="space-y-2">
                {formData.specifications.map((spec, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      value={spec.label}
                      onChange={(e) => updateSpecification(index, "label", e.target.value)}
                      className="flex-1 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-black outline-none transition-all"
                      placeholder="Pression"
                    />
                    <input
                      value={spec.value}
                      onChange={(e) => updateSpecification(index, "value", e.target.value)}
                      className="flex-1 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-black outline-none transition-all"
                      placeholder="1-5 bar"
                    />
                    <Button type="button" onClick={() => removeSpecification(index)} className="p-2 text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg">
                      <Minus size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* --- Documents --- */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700">Documents</label>
            <Button type="button" onClick={addDocument} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs flex items-center gap-1 hover:bg-slate-100">
              <Plus size={12} /> Add document
            </Button>
          </div>
          {formData.documents.length === 0 ? (
            <div className="text-sm text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-lg p-3">
              No documents linked (catalogue, technical sheet, installation guide...).
            </div>
          ) : (
            <div className="space-y-2">
              {formData.documents.map((doc, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_auto_2fr_auto] gap-2 items-center">
                  <input
                    value={doc.title}
                    onChange={(e) => updateDocument(index, "title", e.target.value)}
                    className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-black outline-none transition-all"
                    placeholder="Fiche technique SM19"
                  />
                  <select
                    value={doc.type}
                    onChange={(e) => updateDocument(index, "type", e.target.value)}
                    className="border border-slate-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-black outline-none transition-all"
                  >
                    {DOCUMENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <input
                    value={doc.url}
                    onChange={(e) => updateDocument(index, "url", e.target.value)}
                    className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-black outline-none transition-all"
                    placeholder="https://.../fiche-sm19.pdf"
                  />
                  <Button type="button" onClick={() => removeDocument(index)} className="p-2 text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg">
                    <Minus size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}
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

        {/* --- SEO --- */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <label className="text-sm font-semibold text-slate-700 block">SEO</label>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-600">SEO title</label>
            <input
              name="title"
              className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black outline-none transition-all"
              placeholder="Defaults to the product name if left blank"
              value={formData.seo.title}
              onChange={handleSeoChange}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-600">SEO description</label>
            <textarea
              name="description"
              rows={2}
              className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black outline-none transition-all"
              value={formData.seo.description}
              onChange={handleSeoChange}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-600">Canonical URL</label>
            <input
              name="canonicalUrl"
              className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black outline-none transition-all"
              placeholder="https://sanwater.official/produits/..."
              value={formData.seo.canonicalUrl}
              onChange={handleSeoChange}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="noIndex"
              name="noIndex"
              type="checkbox"
              checked={formData.seo.noIndex}
              onChange={handleSeoChange}
              className="h-4 w-4 rounded border-slate-300"
            />
            <label htmlFor="noIndex" className="text-sm font-semibold text-slate-700">
              Hide from search engines (noindex)
            </label>
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
