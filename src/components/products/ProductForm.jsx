import { useEffect, useMemo, useState } from "react";
import {
  createProduct,
  updateProduct,
} from "@/services/products/productServices";
import { getCategories } from "@/services/products/categoryServices";
import { getCollections } from "@/services/products/collectionServices";
import ProductGalleryUpload from "./ProductGalleryUpload";
import { Button } from "..";
import { destroyImage } from "@/services/contents/imageHandler";
import { toast } from "sonner";

/* ---------------------------------------------------------
   Constants
--------------------------------------------------------- */

const emptyVariantGroup = () => ({
  variantType: "color",
  variants: [{ variantData: "" }],
});

const emptySpecification = () => ({
  label: "",
  value: "",
});

const emptyDocument = () => ({
  title: "",
  type: "technical_sheet",
  url: "",
});

const DOCUMENT_TYPES = [
  { value: "catalogue", label: "Catalogue" },
  { value: "technical_sheet", label: "Technical sheet" },
  { value: "installation_guide", label: "Installation guide" },
  { value: "warranty", label: "Warranty" },
  { value: "presentation", label: "Presentation" },
  { value: "other", label: "Other" },
];

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */

function flattenCategoryOptions(categories) {
  const options = [];

  (categories || []).forEach((category) => {
    options.push({
      value: category._id,
      label: category.name,
      depth: 0,
    });

    (category.subcategories || []).forEach((subcategory) => {
      options.push({
        value: subcategory._id,
        label: subcategory.name,
        depth: 1,
      });
    });
  });

  return options;
}

/* ---------------------------------------------------------
   Reusable UI
--------------------------------------------------------- */

function Section({ eyebrow, title, description, children, className = "" }) {
  return (
    <section
      className={`
        rounded-3xl
        border
        border-slate-200/70
        bg-white
        ${className}
      `}
    >
      <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-600">
              {eyebrow}
            </p>
          )}

          <h2 className="text-base font-semibold tracking-tight text-slate-950">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="px-5 py-6 sm:px-7">{children}</div>
    </section>
  );
}

function Field({ label, description, required = false, children }) {
  return (
    <div className="space-y-2">
      <div>
        <label className="block text-sm font-medium text-slate-800">
          {label}

          {required && <span className="ml-1 text-blue-600">*</span>}
        </label>

        {description && (
          <p className="mt-0.5 text-xs leading-5 text-slate-400">
            {description}
          </p>
        )}
      </div>

      {children}
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className={`
        h-11 w-full
        rounded-xl
        border
        border-slate-200
        bg-slate-50/60
        px-3.5
        text-sm
        text-slate-900
        outline-none
        transition
        placeholder:text-slate-400
        focus:border-blue-400
        focus:bg-white
        focus:ring-4
        focus:ring-blue-500/10
        disabled:cursor-not-allowed
        disabled:bg-slate-100
        disabled:text-slate-400
        ${props.className || ""}
      `}
    />
  );
}

function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`
        min-h-[110px] w-full
        resize-y
        rounded-xl
        border
        border-slate-200
        bg-slate-50/60
        px-3.5
        py-3
        text-sm
        leading-6
        text-slate-900
        outline-none
        transition
        placeholder:text-slate-400
        focus:border-blue-400
        focus:bg-white
        focus:ring-4
        focus:ring-blue-500/10
        ${props.className || ""}
      `}
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className={`
        h-11 w-full
        rounded-xl
        border
        border-slate-200
        bg-slate-50/60
        px-3.5
        text-sm
        text-slate-900
        outline-none
        transition
        focus:border-blue-400
        focus:bg-white
        focus:ring-4
        focus:ring-blue-500/10
        ${props.className || ""}
      `}
    />
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="
        flex
        w-full
        items-center
        justify-between
        gap-4
        rounded-2xl
        border
        border-slate-200/80
        bg-slate-50/50
        px-4
        py-3.5
        text-left
        transition
        hover:border-blue-100
        hover:bg-blue-50/30
      "
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800">{label}</p>

        {description && (
          <p className="mt-0.5 text-xs leading-5 text-slate-400">
            {description}
          </p>
        )}
      </div>

      <span
        className={`
          relative
          h-6
          w-11
          shrink-0
          rounded-full
          transition
          ${checked ? "bg-blue-600" : "bg-slate-300"}
        `}
      >
        <span
          className={`
            absolute
            top-1
            h-4
            w-4
            rounded-full
            bg-white
            transition-transform
            ${checked ? "translate-x-6" : "translate-x-1"}
          `}
        />
      </span>
    </button>
  );
}

/* ---------------------------------------------------------
   Main component
--------------------------------------------------------- */

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
        Array.isArray(product?.productVariants) &&
        product.productVariants.length > 0
          ? product.productVariants.map((variantGroup) => ({
              variantType: variantGroup.variantType || "color",

              variants:
                Array.isArray(variantGroup.variants) &&
                variantGroup.variants.length > 0
                  ? variantGroup.variants.map((variant) => ({
                      variantData: variant.variantData || "",
                    }))
                  : [{ variantData: "" }],
            }))
          : [],

      slug: product?.slug || "",
      status: product?.status || "draft",

      category: product?.category?._id || product?.category || "",

      subcategory: product?.subcategory?._id || product?.subcategory || "",

      collection: product?.collectionRef?._id || product?.collectionRef || "",

      shortDescription: product?.shortDescription || "",

      description: product?.description || "",

      material: product?.material || "",

      finishes: Array.isArray(product?.finishes)
        ? product.finishes.join(", ")
        : "",

      dimensions: product?.dimensions || "",

      installation: product?.installation || "",

      applications: Array.isArray(product?.applications)
        ? product.applications.join(", ")
        : "",

      specifications:
        Array.isArray(product?.specifications) &&
        product.specifications.length > 0
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
    [product, currentUserId],
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

        setCategoryOptions(
          flattenCategoryOptions(categoriesRes?.data?.categories),
        );

        setCollectionOptions(collectionsRes?.data?.collections || []);
      } catch (error) {
        console.error("Failed to load categories/collections", error);
      }
    })();
  }, []);

  /* -------------------------------------------------------
     Form handlers
  ------------------------------------------------------- */

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

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

  const handleSeoChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,

      seo: {
        ...prev.seo,
        [name]: type === "checkbox" ? checked : value,
      },
    }));
  };

  const handlePriceChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,

      prices: {
        ...prev.prices,

        [name]: value === "" ? 0 : Number(value),
      },
    }));
  };

  /* -------------------------------------------------------
     Variants
  ------------------------------------------------------- */

  const addVariantGroup = () => {
    setFormData((prev) => ({
      ...prev,

      productVariants: [...prev.productVariants, emptyVariantGroup()],
    }));
  };

  const removeVariantGroup = (groupIndex) => {
    setFormData((prev) => ({
      ...prev,

      productVariants: prev.productVariants.filter(
        (_, index) => index !== groupIndex,
      ),
    }));
  };

  const updateVariantGroupType = (groupIndex, value) => {
    setFormData((prev) => ({
      ...prev,

      productVariants: prev.productVariants.map((group, index) =>
        index === groupIndex
          ? {
              ...group,
              variantType: value,
            }
          : group,
      ),
    }));
  };

  const addVariantValue = (groupIndex) => {
    setFormData((prev) => ({
      ...prev,

      productVariants: prev.productVariants.map((group, index) =>
        index === groupIndex
          ? {
              ...group,
              variants: [
                ...group.variants,
                {
                  variantData: "",
                },
              ],
            }
          : group,
      ),
    }));
  };

  const removeVariantValue = (groupIndex, valueIndex) => {
    setFormData((prev) => ({
      ...prev,

      productVariants: prev.productVariants.map((group, index) => {
        if (index !== groupIndex) {
          return group;
        }

        const variants = group.variants.filter(
          (_, itemIndex) => itemIndex !== valueIndex,
        );

        return {
          ...group,
          variants: variants.length > 0 ? variants : [{ variantData: "" }],
        };
      }),
    }));
  };

  const updateVariantValue = (groupIndex, valueIndex, value) => {
    setFormData((prev) => ({
      ...prev,

      productVariants: prev.productVariants.map((group, index) => {
        if (index !== groupIndex) {
          return group;
        }

        return {
          ...group,

          variants: group.variants.map((variant, itemIndex) =>
            itemIndex === valueIndex
              ? {
                  ...variant,
                  variantData: value,
                }
              : variant,
          ),
        };
      }),
    }));
  };

  /* -------------------------------------------------------
     Specifications
  ------------------------------------------------------- */

  const addSpecification = () => {
    setFormData((prev) => ({
      ...prev,

      specifications: [...prev.specifications, emptySpecification()],
    }));
  };

  const updateSpecification = (index, key, value) => {
    setFormData((prev) => ({
      ...prev,

      specifications: prev.specifications.map(
        (specification, specificationIndex) =>
          specificationIndex === index
            ? {
                ...specification,
                [key]: value,
              }
            : specification,
      ),
    }));
  };

  const removeSpecification = (index) => {
    setFormData((prev) => ({
      ...prev,

      specifications: prev.specifications.filter(
        (_, specificationIndex) => specificationIndex !== index,
      ),
    }));
  };

  /* -------------------------------------------------------
     Documents
  ------------------------------------------------------- */

  const addDocument = () => {
    setFormData((prev) => ({
      ...prev,

      documents: [...prev.documents, emptyDocument()],
    }));
  };

  const updateDocument = (index, key, value) => {
    setFormData((prev) => ({
      ...prev,

      documents: prev.documents.map((document, documentIndex) =>
        documentIndex === index
          ? {
              ...document,
              [key]: value,
            }
          : document,
      ),
    }));
  };

  const removeDocument = (index) => {
    setFormData((prev) => ({
      ...prev,

      documents: prev.documents.filter(
        (_, documentIndex) => documentIndex !== index,
      ),
    }));
  };

  /* -------------------------------------------------------
     Submit
  ------------------------------------------------------- */

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

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

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
          .map((value) => value.trim())
          .filter(Boolean),

        applications: formData.applications
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),

        specifications: formData.specifications.filter(
          (specification) =>
            specification.label?.trim() && specification.value?.trim(),
        ),

        documents: formData.documents.filter(
          (document) => document.title?.trim() && document.url?.trim(),
        ),

        category: formData.category || null,

        subcategory: formData.subcategory || null,

        collection: formData.collection || null,

        productVariants: formData.productVariants
          .map((group) => ({
            variantType: group.variantType?.trim() || "color",

            variants: (group.variants || [])
              .map((variant) => ({
                variantData: variant.variantData?.trim() || "",
              }))
              .filter((variant) => variant.variantData),
          }))
          .filter((group) => group.variants.length > 0),

        gallery,

        prices: {
          productPrice: Number(formData.prices.productPrice) || 0,

          shippingPrice: Number(formData.prices.shippingPrice) || 0,
        },
      };

      if (!payload.slug) {
        delete payload.slug;
      }

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

  /* -------------------------------------------------------
     Gallery
  ------------------------------------------------------- */

  async function deleteImageFromGallery(imageUrl) {
    try {
      setLoading(true);

      await destroyImage(imageUrl);

      setGallery((current) =>
        current.filter((element) => element !== imageUrl),
      );
    } catch (error) {
      console.error(error);

      toast.error("Failed to delete image.");
    } finally {
      setLoading(false);
    }
  }

  /* -------------------------------------------------------
     Render
  ------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-[#f5f8fc]">
      <div className="mx-auto w-full max-w-[1500px] px-4 pb-32 pt-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit}>
          {/* -------------------------------------------------
              TOP EDITOR BAR
          ------------------------------------------------- */}

          <div
            className="
              sticky
              top-4
              z-40
              mb-6
              rounded-3xl
              border
              border-white/80
              bg-white/75
              px-4
              py-3
              backdrop-blur-2xl
              backdrop-saturate-150
              shadow-xs
              sm:px-5
            "
          >
            <div
              className="
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-600">
                  {isEditMode ? "Product editor" : "New product"}
                </p>

                <h1 className="truncate text-lg font-semibold tracking-tight text-slate-950">
                  {isEditMode
                    ? formData.name || "Edit product"
                    : "Create product"}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`
                    hidden
                    rounded-full
                    border
                    px-3
                    py-1.5
                    text-xs
                    font-medium
                    sm:inline-flex
                    ${
                      formData.status === "published"
                        ? "border-blue-100 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-500"
                    }
                  `}
                >
                  {formData.status === "published"
                    ? "Published"
                    : formData.status === "archived"
                      ? "Archived"
                      : "Draft"}
                </span>

                <Button
                  type="submit"
                  disabled={loading}
                  className="
                    h-10
                    rounded-xl
                    bg-blue-600
                    px-5
                    text-sm
                    font-medium
                    text-white
                    transition
                    hover:bg-blue-700
                    active:bg-blue-800
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {loading
                    ? "Saving..."
                    : isEditMode
                      ? "Save changes"
                      : "Create product"}
                </Button>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------
              BASIC INFORMATION
          ------------------------------------------------- */}

          <div className="space-y-5">
            <Section
              eyebrow="01"
              title="Product identity"
              description="Core information used to identify and manage this product."
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="Product name" required>
                  <Input
                    name="name"
                    required
                    placeholder="Douchettes D’ablution"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </Field>

                <Field label="SKU / Product ID" required>
                  <Input
                    name="productId"
                    required
                    placeholder="SM19"
                    value={formData.productId}
                    onChange={handleChange}
                  />
                </Field>

                <Field
                  label="Serial number"
                  required={!isEditMode}
                  description={
                    isEditMode
                      ? "Serial number cannot be modified after creation."
                      : "Unique identifier for this product."
                  }
                >
                  <Input
                    name="serialNumber"
                    required={!isEditMode}
                    disabled={isEditMode}
                    placeholder="SN-2025-001"
                    value={formData.serialNumber}
                    onChange={handleChange}
                  />
                </Field>

                <Field
                  label="Serie / Family"
                  description="Optional grouping used to associate related products."
                >
                  <Input
                    name="family"
                    placeholder="e.g. SM"
                    value={formData.family}
                    onChange={handleChange}
                  />
                </Field>

                <Field
                  label="Author"
                  required
                  description={
                    currentUserId
                      ? "Assigned automatically from the current account."
                      : "User or administrator responsible for this product."
                  }
                >
                  <Input
                    name="author"
                    required
                    readOnly={!!currentUserId}
                    placeholder="User ID / Admin ID"
                    value={formData.author}
                    onChange={handleChange}
                  />
                </Field>

                <Field
                  label="Tags"
                  description="Separate multiple values with commas."
                >
                  <Input
                    name="tags"
                    placeholder="100% ALUMINIUM, Premium, Durable"
                    value={formData.tags}
                    onChange={handleChange}
                  />
                </Field>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                <Toggle
                  checked={formData.isActive}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: value,
                    }))
                  }
                  label="Active product"
                  description="Controls whether the product is available in the system."
                />

                <Toggle
                  checked={formData.isEcommerce}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      isEcommerce: value,
                    }))
                  }
                  label="Available for ecommerce"
                  description="Include this product in the ecommerce catalog."
                />
              </div>
            </Section>

            {/* -------------------------------------------------
                PRICING
            ------------------------------------------------- */}

            <Section
              eyebrow="02"
              title="Pricing"
              description="Define the commercial values used for this product."
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="Product price" required>
                  <div className="relative">
                    <Input
                      name="productPrice"
                      type="number"
                      min="0"
                      placeholder="1509"
                      value={formData.prices.productPrice}
                      onChange={handlePriceChange}
                      className="pr-14"
                    />

                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                      DA
                    </span>
                  </div>
                </Field>

                <Field
                  label="Shipping price"
                  description="Default delivery/shipping amount."
                >
                  <div className="relative">
                    <Input
                      name="shippingPrice"
                      type="number"
                      min="0"
                      placeholder="800"
                      value={formData.prices.shippingPrice}
                      onChange={handlePriceChange}
                      className="pr-14"
                    />

                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                      DA
                    </span>
                  </div>
                </Field>
              </div>
            </Section>

            {/* -------------------------------------------------
                CATALOG
            ------------------------------------------------- */}

            <Section
              eyebrow="03"
              title="Catalog placement"
              description="Control where this product appears in your catalog structure."
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="Category">
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="">Uncategorized</option>

                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.depth > 0 ? `— ${option.label}` : option.label}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Collection">
                  <Select
                    name="collection"
                    value={formData.collection}
                    onChange={handleChange}
                  >
                    <option value="">No collection</option>

                    {collectionOptions.map((collection) => (
                      <option key={collection._id} value={collection._id}>
                        {collection.name}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field
                  label="Publication status"
                  description="Controls the lifecycle state of the product."
                >
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="draft">Draft</option>

                    <option value="published">Published</option>

                    <option value="archived">Archived</option>
                  </Select>
                </Field>

                <Field
                  label="URL slug"
                  description={
                    isEditMode
                      ? "Changing the slug can break the existing public URL."
                      : "Leave blank to let the backend generate it."
                  }
                >
                  <Input
                    name="slug"
                    placeholder="mitigeur-lavabo-sm19"
                    value={formData.slug}
                    onChange={handleChange}
                  />

                  {isEditMode && (
                    <p className="text-xs leading-5 text-amber-600">
                      Existing public URLs may be affected.
                    </p>
                  )}
                </Field>
              </div>
            </Section>

            {/* -------------------------------------------------
                CONTENT
            ------------------------------------------------- */}

            <Section
              eyebrow="04"
              title="Product content"
              description="Write the information customers and catalog visitors will see."
            >
              <div className="space-y-5">
                <Field
                  label="Short description"
                  description="Used in product listings and compact cards."
                >
                  <div className="relative">
                    <Textarea
                      name="shortDescription"
                      rows={3}
                      maxLength={300}
                      placeholder="One or two sentences shown in listings."
                      value={formData.shortDescription}
                      onChange={handleChange}
                    />

                    <span className="absolute bottom-2.5 right-3 text-[10px] text-slate-400">
                      {formData.shortDescription.length}/300
                    </span>
                  </div>
                </Field>

                <Field
                  label="Full description"
                  description="Detailed description shown on the product page."
                >
                  <Textarea
                    name="description"
                    rows={7}
                    placeholder="Detailed description shown on the product page."
                    value={formData.description}
                    onChange={handleChange}
                  />
                </Field>
              </div>
            </Section>

            {/* -------------------------------------------------
                TECHNICAL
            ------------------------------------------------- */}

            <Section
              eyebrow="05"
              title="Technical information"
              description="Technical attributes used to describe and document the product."
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="Material">
                  <Input
                    name="material"
                    placeholder="e.g. Aluminium"
                    value={formData.material}
                    onChange={handleChange}
                  />
                </Field>

                <Field
                  label="Finishes"
                  description="Separate multiple finishes with commas."
                >
                  <Input
                    name="finishes"
                    placeholder="Chromé, Noir mat"
                    value={formData.finishes}
                    onChange={handleChange}
                  />
                </Field>

                <Field label="Dimensions">
                  <Input
                    name="dimensions"
                    placeholder="e.g. 15 x 20 x 8 cm"
                    value={formData.dimensions}
                    onChange={handleChange}
                  />
                </Field>

                <Field label="Installation">
                  <Input
                    name="installation"
                    placeholder="e.g. Montage mural"
                    value={formData.installation}
                    onChange={handleChange}
                  />
                </Field>

                <div className="md:col-span-2">
                  <Field
                    label="Applications"
                    description="Separate multiple applications with commas."
                  >
                    <Input
                      name="applications"
                      placeholder="Hôtellerie, Résidentiel, Commercial"
                      value={formData.applications}
                      onChange={handleChange}
                    />
                  </Field>
                </div>
              </div>

              {/* Specifications */}
              <div className="mt-8">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Specifications
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Add structured technical values such as pressure,
                      dimensions or capacity.
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={addSpecification}
                    className="
                      h-9
                      rounded-xl
                      border
                      border-blue-100
                      bg-blue-50
                      px-3.5
                      text-xs
                      font-medium
                      text-blue-700
                      transition
                      hover:bg-blue-100
                    "
                  >
                    Add specification
                  </Button>
                </div>

                {formData.specifications.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center">
                    <p className="text-sm font-medium text-slate-600">
                      No specifications yet
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Add structured technical values when needed.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.specifications.map((specification, index) => (
                      <div
                        key={index}
                        className="
                            grid
                            grid-cols-1
                            gap-3
                            rounded-2xl
                            border
                            border-slate-200
                            bg-slate-50/50
                            p-3
                            md:grid-cols-[1fr_1fr_auto]
                          "
                      >
                        <Input
                          value={specification.label}
                          onChange={(event) =>
                            updateSpecification(
                              index,
                              "label",
                              event.target.value,
                            )
                          }
                          placeholder="Specification"
                        />

                        <Input
                          value={specification.value}
                          onChange={(event) =>
                            updateSpecification(
                              index,
                              "value",
                              event.target.value,
                            )
                          }
                          placeholder="Value"
                        />

                        <Button
                          type="button"
                          onClick={() => removeSpecification(index)}
                          className="
                              h-11
                              rounded-xl
                              border
                              border-red-100
                              bg-red-50
                              px-4
                              text-sm
                              font-medium
                              text-red-600
                              transition
                              hover:bg-red-100
                            "
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Section>

            {/* -------------------------------------------------
                DOCUMENTS
            ------------------------------------------------- */}

            <Section
              eyebrow="06"
              title="Documents"
              description="Attach catalogues, technical sheets, installation guides and other resources."
            >
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Product documents
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Only documents with both a title and URL will be submitted.
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={addDocument}
                  className="
                    h-9
                    rounded-xl
                    border
                    border-blue-100
                    bg-blue-50
                    px-3.5
                    text-xs
                    font-medium
                    text-blue-700
                    transition
                    hover:bg-blue-100
                  "
                >
                  Add document
                </Button>
              </div>

              {formData.documents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center">
                  <p className="text-sm font-medium text-slate-600">
                    No documents linked
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Catalogue, technical sheet, installation guide, warranty,
                    etc.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.documents.map((document, index) => (
                    <div
                      key={index}
                      className="
                          rounded-2xl
                          border
                          border-slate-200
                          bg-slate-50/50
                          p-3
                        "
                    >
                      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.1fr_0.7fr_1.8fr_auto]">
                        <Input
                          value={document.title}
                          onChange={(event) =>
                            updateDocument(index, "title", event.target.value)
                          }
                          placeholder="Fiche technique SM19"
                        />

                        <Select
                          value={document.type}
                          onChange={(event) =>
                            updateDocument(index, "type", event.target.value)
                          }
                        >
                          {DOCUMENT_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </Select>

                        <Input
                          value={document.url}
                          onChange={(event) =>
                            updateDocument(index, "url", event.target.value)
                          }
                          placeholder="https://.../fiche-sm19.pdf"
                        />

                        <Button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="
                              h-11
                              rounded-xl
                              border
                              border-red-100
                              bg-red-50
                              px-4
                              text-sm
                              font-medium
                              text-red-600
                              transition
                              hover:bg-red-100
                            "
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* -------------------------------------------------
                VARIANTS
            ------------------------------------------------- */}

            <Section
              eyebrow="07"
              title="Product variants"
              description="Create reusable groups such as color, size, material or finish."
            >
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Variant groups
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Each group can contain multiple values.
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={addVariantGroup}
                  className="
                    h-9
                    rounded-xl
                    bg-blue-600
                    px-3.5
                    text-xs
                    font-medium
                    text-white
                    transition
                    hover:bg-blue-700
                  "
                >
                  Add variant group
                </Button>
              </div>

              {formData.productVariants.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center">
                  <p className="text-sm font-medium text-slate-600">
                    No variants added
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Add a variant group when this product has multiple options.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.productVariants.map((group, groupIndex) => (
                    <div
                      key={groupIndex}
                      className="
                          rounded-2xl
                          border
                          border-slate-200
                          bg-slate-50/50
                          p-4
                          sm:p-5
                        "
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="min-w-0 flex-1">
                          <label className="mb-2 block text-xs font-medium uppercase tracking-[0.1em] text-slate-400">
                            Variant type
                          </label>

                          <Input
                            value={group.variantType}
                            onChange={(event) =>
                              updateVariantGroupType(
                                groupIndex,
                                event.target.value,
                              )
                            }
                            placeholder="Color, Size, Material..."
                          />
                        </div>

                        <Button
                          type="button"
                          onClick={() => removeVariantGroup(groupIndex)}
                          className="
                              h-11
                              rounded-xl
                              border
                              border-red-100
                              bg-red-50
                              px-4
                              text-sm
                              font-medium
                              text-red-600
                              transition
                              hover:bg-red-100
                            "
                        >
                          Remove group
                        </Button>
                      </div>

                      <div className="mt-5">
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-700">
                            Values
                          </p>

                          <Button
                            type="button"
                            onClick={() => addVariantValue(groupIndex)}
                            className="
                                h-8
                                rounded-lg
                                border
                                border-slate-200
                                bg-white
                                px-3
                                text-xs
                                font-medium
                                text-slate-600
                                transition
                                hover:border-blue-100
                                hover:bg-blue-50
                                hover:text-blue-700
                              "
                          >
                            Add value
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {group.variants.map((variant, valueIndex) => (
                            <div
                              key={valueIndex}
                              className="
                                    flex
                                    flex-col
                                    gap-2
                                    sm:flex-row
                                  "
                            >
                              <Input
                                value={variant.variantData}
                                onChange={(event) =>
                                  updateVariantValue(
                                    groupIndex,
                                    valueIndex,
                                    event.target.value,
                                  )
                                }
                                placeholder="Variant value"
                              />

                              <Button
                                type="button"
                                onClick={() =>
                                  removeVariantValue(groupIndex, valueIndex)
                                }
                                className="
                                      h-11
                                      rounded-xl
                                      border
                                      border-slate-200
                                      bg-white
                                      px-4
                                      text-sm
                                      font-medium
                                      text-slate-500
                                      transition
                                      hover:border-red-100
                                      hover:bg-red-50
                                      hover:text-red-600
                                    "
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* -------------------------------------------------
                MEDIA
            ------------------------------------------------- */}

            <Section
              eyebrow="08"
              title="Product media"
              description="Upload and manage the images used throughout your product experience."
            >
              <div
                className="
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50/60
                  p-4
                  sm:p-5
                "
              >
                <ProductGalleryUpload setGallery={setGallery} />

                {gallery.length > 0 && (
                  <div className="mt-6 border-t border-slate-200 pt-6">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-700">
                        Gallery
                      </p>

                      <span className="text-xs text-slate-400">
                        {gallery.length}{" "}
                        {gallery.length === 1 ? "image" : "images"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                      {gallery.map((image, index) => (
                        <div
                          key={`${image}-${index}`}
                          className="
                              group
                              relative
                              overflow-hidden
                              rounded-2xl
                              border
                              border-slate-200
                              bg-white
                            "
                        >
                          <div className="aspect-square">
                            <img
                              src={image}
                              alt={`Product image ${index + 1}`}
                              className="
                                  h-full
                                  w-full
                                  object-cover
                                "
                            />
                          </div>

                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-8 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              type="button"
                              onClick={() => deleteImageFromGallery(image)}
                              className="
                                  h-8
                                  w-full
                                  rounded-lg
                                  bg-white/90
                                  px-3
                                  text-xs
                                  font-medium
                                  text-red-600
                                  backdrop-blur-md
                                  transition
                                  hover:bg-white
                                "
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>

            {/* -------------------------------------------------
                SEO
            ------------------------------------------------- */}

            <Section
              eyebrow="09"
              title="Search optimization"
              description="Control how this product is represented to search engines."
            >
              <div className="space-y-5">
                <Field
                  label="SEO title"
                  description="Defaults to the product name when left blank."
                >
                  <Input
                    name="title"
                    placeholder="Defaults to the product name if left blank"
                    value={formData.seo.title}
                    onChange={handleSeoChange}
                  />
                </Field>

                <Field
                  label="SEO description"
                  description="A concise description for search engine result pages."
                >
                  <Textarea
                    name="description"
                    rows={4}
                    value={formData.seo.description}
                    onChange={handleSeoChange}
                  />
                </Field>

                <Field label="Canonical URL">
                  <Input
                    name="canonicalUrl"
                    placeholder="https://sanwater.official/produits/..."
                    value={formData.seo.canonicalUrl}
                    onChange={handleSeoChange}
                  />
                </Field>

                <Toggle
                  checked={formData.seo.noIndex}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,

                      seo: {
                        ...prev.seo,
                        noIndex: value,
                      },
                    }))
                  }
                  label="Hide from search engines"
                  description="Adds the noindex directive to the product."
                />
              </div>
            </Section>
          </div>
        </form>
      </div>

      {/* -----------------------------------------------------
          STICKY SAVE BAR
      ----------------------------------------------------- */}

      <div
        className="
          fixed
          inset-x-0
          bottom-0
          z-50
          border-t
          border-white/80
          bg-white/75
          px-4
          py-3
          backdrop-blur-2xl
          backdrop-saturate-150
          shadow-xs
          sm:px-6
        "
      >
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-xs font-medium text-slate-700">
              {isEditMode
                ? "Changes are ready to be saved."
                : "Complete the product information before publishing."}
            </p>

            <p className="mt-0.5 text-[11px] text-slate-400">
              Required fields are marked in blue.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => document.querySelector("form")?.requestSubmit()}
            disabled={loading}
            className="
              ml-auto
              h-10
              rounded-xl
              bg-blue-600
              px-6
              text-sm
              font-medium
              text-white
              transition
              hover:bg-blue-700
              active:bg-blue-800
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loading
              ? "Saving..."
              : isEditMode
                ? "Save changes"
                : "Create product"}
          </Button>
        </div>
      </div>
    </div>
  );
}
