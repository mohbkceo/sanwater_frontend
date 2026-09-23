import { useTranslation } from "@/lib/i18n";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  createProduct,
  updateProduct,
} from "@/services/products/productServices";
import ProductGalleryUpload from "./ProductGalleryUpload";
import { Button } from "..";
import { destroyImage } from "@/services/contents/imageHandler";
import { toast } from "sonner";
import { SANWATERGROUPROUTES } from "@/configs/routes/routesConfig";

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
  { value: "catalogue", labelKey: "admin.products.document_type_catalogue" },
  { value: "technical_sheet", labelKey: "admin.products.document_type_technical_sheet" },
  { value: "installation_guide", labelKey: "admin.products.document_type_installation_guide" },
  { value: "warranty", labelKey: "admin.products.document_type_warranty" },
  { value: "presentation", labelKey: "admin.products.document_type_presentation" },
  { value: "other", labelKey: "admin.products.document_type_other" },
];

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

          {required && <span className="ms-1 text-blue-600">*</span>}
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
        text-start
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
  const { t } = useTranslation();
  const isEditMode = !!product?.serialNumber;

  const initialFormData = useMemo(
    () => ({
      author: product?.author || currentUserId || "",
      name: product?.name || "",
      serialNumber: product?.serialNumber || "",
      productId: product?.productId || "",
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

    toast.success(t("admin.products.product_updated", { name: payload.name }));
  }

  async function createProductFunc(payload) {
    await createProduct(payload);

    toast.success(t("admin.products.product_created", { name: payload.name }));

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

      if (isEditMode) {
        await updateProductFunc(payload);
      } else {
        await createProductFunc(payload);
      }
    } catch (error) {
      console.error(error);

      toast.error(t("admin.products.something_went_wrong_while_saving_the_product"));
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

      toast.error(t("admin.products.failed_to_delete_image"));
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
                  {isEditMode ? t("admin.products.product_editor") : t("admin.products.new_product")}
                </p>

                <h1 className="truncate text-lg font-semibold tracking-tight text-slate-950">
                  {isEditMode
                    ? formData.name || t("admin.products.edit_product")
                    : t("admin.products.create_product")}
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
                    ? t("admin.products.published")
                    : formData.status === "archived"
                      ? t("admin.products.archived")
                      : t("admin.products.draft")}
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
                    ? t("admin.products.saving")
                    : isEditMode
                      ? t("admin.products.save_changes")
                      : t("admin.products.create_product")}
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
              title={t("admin.products.product_identity")}
              description={t("admin.products.core_information_used_to_identify_and_manage_this_product")}
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label={t("admin.products.product_name")} required>
                  <Input
                    name="name"
                    required
                    placeholder={t("admin.products.douchettes_d_ablution")}
                    value={formData.name}
                    onChange={handleChange}
                  />
                </Field>

                <Field label={t("admin.products.sku_product_id")} required>
                  <Input
                    name="productId"
                    required
                    placeholder={t("admin.products.sm19")}
                    value={formData.productId}
                    onChange={handleChange}
                  />
                </Field>

                <Field
                  label={t("admin.products.serial_number")}
                  required={!isEditMode}
                  description={
                    isEditMode
                      ? t("admin.products.serial_number_immutable")
                      : t("admin.products.serial_number_description")
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
                  label={t("admin.products.tags")}
                  description={t("admin.products.separate_multiple_values_with_commas")}
                >
                  <Input
                    name="tags"
                    placeholder={t("admin.products.100_aluminium_premium_durable")}
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
                  label={t("admin.products.active_product")}
                  description={t("admin.products.controls_whether_the_product_is_available_in_the_system")}
                />

                <Toggle
                  checked={formData.isEcommerce}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      isEcommerce: value,
                    }))
                  }
                  label={t("admin.products.available_for_ecommerce")}
                  description={t("admin.products.include_this_product_in_the_ecommerce_catalog")}
                />
              </div>
            </Section>

            {/* -------------------------------------------------
                PRICING
            ------------------------------------------------- */}

            <Section
              eyebrow="02"
              title={t("admin.products.pricing")}
              description={t("admin.products.define_the_commercial_values_used_for_this_product")}
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label={t("admin.products.product_price")} required>
                  <div className="relative">
                    <Input
                      name="productPrice"
                      type="number"
                      min="0"
                      placeholder="1509"
                      value={formData.prices.productPrice}
                      onChange={handlePriceChange}
                      className="pe-14"
                    />

                    <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                      DA
                    </span>
                  </div>
                </Field>

                <Field
                  label={t("admin.products.shipping_price")}
                  description={t("admin.products.default_delivery_shipping_amount")}
                >
                  <div className="relative">
                    <Input
                      name="shippingPrice"
                      type="number"
                      min="0"
                      placeholder="800"
                      value={formData.prices.shippingPrice}
                      onChange={handlePriceChange}
                      className="pe-14"
                    />

                    <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
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
              title={t("admin.products.classification")}
              description={t("admin.products.classification_is_managed_from_families_sub_families_product_id")}
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{t("admin.products.current_assignment")}</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div><p className="text-xs text-slate-400">{t("admin.products.family")}</p><p className="mt-1 font-semibold text-slate-800">{product?.family?.name || t("admin.products.unassigned")}</p></div>
                    <div><p className="text-xs text-slate-400">{t("admin.products.sub_family")}</p><p className="mt-1 font-semibold text-slate-800">{product?.subFamily?.name || t("admin.products.unassigned")}</p></div>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-500">{isEditMode ? t("admin.products.to_assign_or_move_this_product_open_the_destination") : t("admin.products.this_product_will_be_created_unassigned_you_can_classify")}</p>
                  <Link to={SANWATERGROUPROUTES.products.families.control.fullPath} className="mt-3 inline-flex h-9 items-center rounded-xl border border-blue-200 bg-white px-3 text-xs font-semibold text-blue-700 hover:bg-blue-50">{t("admin.products.manage_assignment")}</Link>
                </div>

                <Field
                  label={t("admin.products.publication_status")}
                  description={t("admin.products.controls_the_lifecycle_state_of_the_product")}
                >
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="draft">{t("admin.products.draft")}</option>

                    <option value="published">{t("admin.products.published")}</option>

                    <option value="archived">{t("admin.products.archived")}</option>
                  </Select>
                </Field>

                <Field
                  label={t("admin.products.url_slug")}
                  description={
                    isEditMode
                      ? t("admin.products.slug_change_warning")
                      : t("admin.products.slug_auto_generation")
                  }
                >
                  <Input
                    name="slug"
                    placeholder={t("admin.products.mitigeur_lavabo_sm19")}
                    value={formData.slug}
                    onChange={handleChange}
                  />

                  {isEditMode && (
                    <p className="text-xs leading-5 text-amber-600">
                      {t("admin.products.existing_public_urls_may_be_affected")}
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
              title={t("admin.products.product_content")}
              description={t("admin.products.write_the_information_customers_and_catalog_visitors_will_see")}
            >
              <div className="space-y-5">
                <Field
                  label={t("admin.products.short_description")}
                  description={t("admin.products.used_in_product_listings_and_compact_cards")}
                >
                  <div className="relative">
                    <Textarea
                      name="shortDescription"
                      rows={3}
                      maxLength={300}
                      placeholder={t("admin.products.one_or_two_sentences_shown_in_listings")}
                      value={formData.shortDescription}
                      onChange={handleChange}
                    />

                    <span className="absolute bottom-2.5 end-3 text-[10px] text-slate-400">
                      {formData.shortDescription.length}/300
                    </span>
                  </div>
                </Field>

                <Field
                  label={t("admin.products.full_description")}
                  description={t("admin.products.detailed_description_shown_on_the_product_page")}
                >
                  <Textarea
                    name="description"
                    rows={7}
                    placeholder={t("admin.products.detailed_description_shown_on_the_product_page")}
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
              title={t("admin.products.technical_information")}
              description={t("admin.products.technical_attributes_used_to_describe_and_document_the_product")}
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label={t("admin.products.material")}>
                  <Input
                    name="material"
                    placeholder={t("admin.products.e_g_aluminium")}
                    value={formData.material}
                    onChange={handleChange}
                  />
                </Field>

                <Field
                  label={t("admin.products.finishes")}
                  description={t("admin.products.separate_multiple_finishes_with_commas")}
                >
                  <Input
                    name="finishes"
                    placeholder={t("admin.products.chrome_noir_mat")}
                    value={formData.finishes}
                    onChange={handleChange}
                  />
                </Field>

                <Field label={t("admin.products.dimensions")}>
                  <Input
                    name="dimensions"
                    placeholder={t("admin.products.e_g_15_x_20_x_8_cm")}
                    value={formData.dimensions}
                    onChange={handleChange}
                  />
                </Field>

                <Field label={t("admin.products.installation")}>
                  <Input
                    name="installation"
                    placeholder={t("admin.products.e_g_montage_mural")}
                    value={formData.installation}
                    onChange={handleChange}
                  />
                </Field>

                <div className="md:col-span-2">
                  <Field
                    label={t("admin.products.applications")}
                    description={t("admin.products.separate_multiple_applications_with_commas")}
                  >
                    <Input
                      name="applications"
                      placeholder={t("admin.products.hotellerie_residentiel_commercial")}
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
                      {t("admin.products.specifications")}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                      {t("admin.products.add_structured_technical_values_such_as_pressure_dimensions_or")}
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
                    {t("admin.products.add_specification")}
                  </Button>
                </div>

                {formData.specifications.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center">
                    <p className="text-sm font-medium text-slate-600">
                      {t("admin.products.no_specifications_yet")}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {t("admin.products.add_structured_technical_values_when_needed")}
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
                          placeholder={t("admin.products.specification")}
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
                          placeholder={t("admin.products.value")}
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
                          {t("admin.products.remove")}
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
              title={t("admin.products.documents")}
              description={t("admin.products.attach_catalogues_technical_sheets_installation_guides_and_other_resources")}
            >
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {t("admin.products.product_documents")}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {t("admin.products.only_documents_with_both_a_title_and_url_will")}
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
                  {t("admin.products.add_document")}
                </Button>
              </div>

              {formData.documents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center">
                  <p className="text-sm font-medium text-slate-600">
                    {t("admin.products.no_documents_linked")}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {t("admin.products.catalogue_technical_sheet_installation_guide_warranty_etc")}
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
                          placeholder={t("admin.products.fiche_technique_sm19")}
                        />

                        <Select
                          value={document.type}
                          onChange={(event) =>
                            updateDocument(index, "type", event.target.value)
                          }
                        >
                          {DOCUMENT_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {t(type.labelKey)}
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
                          {t("admin.products.remove")}
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
              title={t("admin.products.product_variants")}
              description={t("admin.products.create_reusable_groups_such_as_color_size_material_or")}
            >
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {t("admin.products.variant_groups")}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {t("admin.products.each_group_can_contain_multiple_values")}
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
                  {t("admin.products.add_variant_group")}
                </Button>
              </div>

              {formData.productVariants.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center">
                  <p className="text-sm font-medium text-slate-600">
                    {t("admin.products.no_variants_added")}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {t("admin.products.add_a_variant_group_when_this_product_has_multiple")}
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
                            {t("admin.products.variant_type")}
                          </label>

                          <Input
                            value={group.variantType}
                            onChange={(event) =>
                              updateVariantGroupType(
                                groupIndex,
                                event.target.value,
                              )
                            }
                            placeholder={t("admin.products.color_size_material")}
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
                          {t("admin.products.remove_group")}
                        </Button>
                      </div>

                      <div className="mt-5">
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-700">
                            {t("admin.products.values")}
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
                            {t("admin.products.add_value")}
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
                                placeholder={t("admin.products.variant_value")}
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
                                {t("admin.products.remove")}
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
              title={t("admin.products.product_media")}
              description={t("admin.products.upload_and_manage_the_images_used_throughout_your_product")}
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
                        {t("admin.products.gallery")}
                      </p>

                      <span className="text-xs text-slate-400">
                        {gallery.length}{" "}
                        {gallery.length === 1 ? t("admin.products.image") : t("admin.products.images")}
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
                              {t("admin.products.remove")}
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
              title={t("admin.products.search_optimization")}
              description={t("admin.products.control_how_this_product_is_represented_to_search_engines")}
            >
              <div className="space-y-5">
                <Field
                  label={t("admin.products.seo_title")}
                  description={t("admin.products.defaults_to_the_product_name_when_left_blank")}
                >
                  <Input
                    name="title"
                    placeholder={t("admin.products.defaults_to_the_product_name_if_left_blank")}
                    value={formData.seo.title}
                    onChange={handleSeoChange}
                  />
                </Field>

                <Field
                  label={t("admin.products.seo_description")}
                  description={t("admin.products.a_concise_description_for_search_engine_result_pages")}
                >
                  <Textarea
                    name="description"
                    rows={4}
                    value={formData.seo.description}
                    onChange={handleSeoChange}
                  />
                </Field>

                <Field label={t("admin.products.canonical_url")}>
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
                  label={t("admin.products.hide_from_search_engines")}
                  description={t("admin.products.adds_the_noindex_directive_to_the_product")}
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
                ? t("admin.products.changes_are_ready_to_be_saved")
                : t("admin.products.complete_the_product_information_before_publishing")}
            </p>

            <p className="mt-0.5 text-[11px] text-slate-400">
              {t("admin.products.required_fields_are_marked_in_blue")}
            </p>
          </div>

          <Button
            type="button"
            onClick={() => document.querySelector("form")?.requestSubmit()}
            disabled={loading}
            className="
              ms-auto
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
              ? t("admin.products.saving")
              : isEditMode
                ? t("admin.products.save_changes")
                : t("admin.products.create_product")}
          </Button>
        </div>
      </div>
    </div>
  );
}

