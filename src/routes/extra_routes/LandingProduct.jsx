import { getProduct } from "@/services/products/productServices";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Check,
  ChevronLeft,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Truck,
} from "lucide-react";

const initialFormState = {
  fullName: "",
  phoneNumber: "",
  address: "",
  quantity: 1,
};

export default function ProductPage() {
  const { serialNumber } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");

  const [orderForm, setOrderForm] = useState(initialFormState);

  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await getProduct(serialNumber);
        setProduct(res?.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [serialNumber]);

  useEffect(() => {
    if (!product) return;

    const firstImage =
      product?.gallery?.[0] || product?.image || product?.thumbnail || "";

    setSelectedImage(firstImage);
  }, [product]);

  const images = product?.gallery?.length
    ? product.gallery
    : [product?.image || product?.thumbnail].filter(Boolean);

  const productPrice = Number(product?.prices?.productPrice || 0);

  const shippingPrice = Number(product?.prices?.shippingPrice || 0);

  const formatPrice = (value) =>
    new Intl.NumberFormat("fr-DZ").format(Number(value || 0));

  const quantity = Math.max(1, Number(orderForm.quantity || 1));

  const orderSubtotal = productPrice * quantity;

  const orderShipping = shippingPrice;

  const orderTotal = orderSubtotal + orderShipping;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setOrderForm((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Math.max(1, Number(value || 1)) : value,
    }));
  };

  const changeQuantity = (amount) => {
    setOrderForm((prev) => ({
      ...prev,
      quantity: Math.max(1, Number(prev.quantity || 1) + amount),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setSubmitMessage("");
    setSubmitError("");

    try {
      const payload = {
        items: [
          {
            product: product?._id,
            productName: product?.name || product?.productId || "Produit",
            productSerialNumber: product?.serialNumber,
            quantity,
            note:
              `Sous-total: ${orderSubtotal} DA, ` +
              `Livraison: ${orderShipping} DA, ` +
              `Total: ${orderTotal} DA`,
          },
        ],

        requester: {
          fullName: orderForm.fullName.trim(),
          phone: orderForm.phoneNumber.trim(),
          address: orderForm.address.trim(),
          customerType: "consumer",
        },

        source: "landing_product_page",
      };

      const response = await fetch(
        import.meta.env.VITE_BACK_END_BASE_URL + "/quotations",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error("Order request failed");
      }

      setSubmitMessage("Votre commande a bien été enregistrée.");

      setOrderForm(initialFormState);
    } catch {
      setSubmitError("Impossible de passer la commande. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <ProductSkeleton />;
  }

  if (!product) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-[#f5f5f7]
          px-5
          text-zinc-950
        "
      >
        <div
          className="
            w-full
            max-w-md
            rounded-[28px]
            border
            border-black/[0.07]
            bg-white/75
            p-7
            text-center
            shadow-xs
            backdrop-blur-2xl
            ring-1
            ring-inset
            ring-white/70
          "
        >
          <div
            className="
              mx-auto
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-[16px]
              bg-black/[0.04]
              text-zinc-500
            "
          >
            <Package size={21} strokeWidth={1.7} />
          </div>

          <h2
            className="
              mt-4
              text-[20px]
              font-semibold
              tracking-[-0.02em]
              text-zinc-950
            "
          >
            Produit introuvable
          </h2>

          <p
            className="
              mt-2
              text-[14px]
              leading-6
              text-zinc-500
            "
          >
            Ce produit n&apos;a pas pu être chargé. Vérifiez sa référence ou
            contactez San Water.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#f5f5f7]
        text-zinc-950
        antialiased
      "
    >
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          fixed
          inset-0
          overflow-hidden
        "
      >
        <div
          className="
            absolute
            -left-[15%]
            -top-[18%]
            h-[520px]
            w-[520px]
            rounded-full
            bg-blue-200/20
            blur-[140px]
          "
        />

        <div
          className="
            absolute
            -right-[15%]
            top-[15%]
            h-[460px]
            w-[460px]
            rounded-full
            bg-violet-200/15
            blur-[140px]
          "
        />
      </div>

      <main
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-7xl
          px-4
          py-6

          sm:px-6
          sm:py-8

          lg:px-8
          lg:py-10
        "
      >
        {/* Breadcrumb / context */}
        <div
          className="
            mb-5
            flex
            items-center
            gap-1.5
            text-[12px]
            font-medium
            text-zinc-400
          "
        >
          <span>Catalogue</span>

          <ChevronLeft size={12} className="rotate-180" />

          <span className="truncate text-zinc-600">
            {product.family?.name || "Produits San Water"}
          </span>
        </div>

        <div
          className="
            grid
            items-start
            gap-6

            lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]
            lg:gap-8
          "
        >
          {/* ============================================================ */}
          {/* PRODUCT MEDIA                                                */}
          {/* ============================================================ */}

          <section className="min-w-0">
            <div
              className="
                relative
                overflow-hidden
                rounded-[30px]
                border
                border-black/[0.07]
                bg-white/72
                p-3
                shadow-xs
                backdrop-blur-[24px]
                backdrop-saturate-150
                ring-1
                ring-inset
                ring-white/70

                sm:p-4
              "
            >
              {/* subtle top highlight */}
              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  inset-x-10
                  top-0
                  h-px
                  bg-gradient-to-r
                  from-transparent
                  via-white
                  to-transparent
                "
              />

              {/* Main image */}
              <div
                className="
                  relative
                  overflow-hidden
                  rounded-[24px]
                  bg-white
                  aspect-square

                  lg:aspect-[4/3]
                "
              >
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="
                      h-full
                      w-full
                      object-contain
                      object-center
                      p-3

                      sm:p-5
                    "
                  />
                ) : (
                  <div
                    className="
                      flex
                      h-full
                      items-center
                      justify-center
                      text-[13px]
                      text-zinc-400
                    "
                  >
                    Aucune image disponible
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div
                  className="
                    mt-3
                    flex
                    gap-2
                    overflow-x-auto
                    pb-1
                  "
                >
                  {images.map((image, index) => {
                    const active = selectedImage === image;

                    return (
                      <button
                        type="button"
                        key={`${image}-${index}`}
                        onClick={() => setSelectedImage(image)}
                        aria-label={`Vue ${index + 1}`}
                        className={`
                            h-16
                            w-16
                            shrink-0
                            overflow-hidden
                            rounded-[14px]
                            border
                            bg-white
                            p-1
                            transition
                            duration-200

                            focus-visible:outline-none
                            focus-visible:ring-4
                            focus-visible:ring-black/[0.05]

                            ${
                              active
                                ? `
                                  border-zinc-950
                                  ring-2
                                  ring-black/[0.06]
                                `
                                : `
                                  border-black/[0.07]

                                  hover:border-black/[0.15]
                                `
                            }
                          `}
                      >
                        <img
                          src={image}
                          alt=""
                          className="
                              h-full
                              w-full
                              rounded-[10px]
                              object-cover
                            "
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Minimal product information */}
            <div
              className="
                mt-5
                grid
                gap-3

                sm:grid-cols-2
              "
            >
              <ProductInfo
                label="Catégorie"
                value={product.family?.name || "Accessoires"}
              />

              <ProductInfo
                label="Référence"
                value={product.serialNumber || "—"}
              />
            </div>
          </section>

          {/* ============================================================ */}
          {/* BUYING PANEL                                                 */}
          {/* ============================================================ */}

          <aside
            className="
              lg:sticky
              lg:top-6
            "
          >
            <div
              className="
                relative
                overflow-hidden
                rounded-[30px]
                border
                border-black/[0.07]
                bg-white/75
                p-5
                shadow-xs
                backdrop-blur-[28px]
                backdrop-saturate-150
                ring-1
                ring-inset
                ring-white/75

                sm:p-6
              "
            >
              {/* glass highlight */}
              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  inset-x-10
                  top-0
                  h-px
                  bg-gradient-to-r
                  from-transparent
                  via-white
                  to-transparent
                "
              />

              {/* Product identity */}
              <div className="relative">
                <p
                  className="
                    text-[12px]
                    font-medium
                    text-zinc-400
                  "
                >
                  {product.family?.name || "San Water"}
                </p>

                <h1
                  className="
                    mt-1
                    text-[28px]
                    font-semibold
                    leading-[1.12]
                    tracking-[-0.035em]
                    text-zinc-950

                    sm:text-[32px]
                  "
                >
                  {product.name}
                </h1>

                {product.description && (
                  <p
                    className="
                      mt-3
                      text-[14px]
                      leading-6
                      text-zinc-500
                    "
                  >
                    {product.description}
                  </p>
                )}
              </div>

              {/* Price */}
              <div
                className="
                  relative
                  mt-5
                  rounded-[20px]
                  border
                  border-black/[0.055]
                  bg-black/[0.025]
                  p-4
                "
              >
                <p
                  className="
                    text-[11px]
                    font-medium
                    text-zinc-400
                  "
                >
                  Prix
                </p>

                <div
                  className="
                    mt-1
                    flex
                    items-end
                    justify-between
                    gap-3
                  "
                >
                  <p
                    className="
                      text-[28px]
                      font-semibold
                      tracking-[-0.035em]
                      text-zinc-950
                    "
                  >
                    {productPrice > 0
                      ? `${formatPrice(productPrice)} DA`
                      : "Sur demande"}
                  </p>

                  {shippingPrice > 0 && (
                    <div
                      className="
                        flex
                        items-center
                        gap-1.5
                        text-[11px]
                        text-zinc-500
                      "
                    >
                      <Truck size={13} strokeWidth={1.8} />+
                      {formatPrice(shippingPrice)} DA
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity */}
              <div
                className="
                  relative
                  mt-5
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >
                <div>
                  <p
                    className="
                      text-[13px]
                      font-semibold
                      text-zinc-800
                    "
                  >
                    Quantité
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[11px]
                      text-zinc-400
                    "
                  >
                    Choisissez le nombre d&apos;unités
                  </p>
                </div>

                <div
                  className="
                    flex
                    h-11
                    items-center
                    rounded-[14px]
                    border
                    border-black/[0.08]
                    bg-white/80
                    p-1
                  "
                >
                  <button
                    type="button"
                    onClick={() => changeQuantity(-1)}
                    disabled={quantity <= 1}
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-[10px]
                      text-zinc-500
                      transition

                      hover:bg-black/[0.04]
                      hover:text-zinc-950

                      disabled:cursor-not-allowed
                      disabled:opacity-30
                    "
                  >
                    <Minus size={14} />
                  </button>

                  <input
                    type="number"
                    min="1"
                    name="quantity"
                    value={orderForm.quantity}
                    onChange={handleChange}
                    className="
                      h-8
                      w-10
                      appearance-none
                      bg-transparent
                      text-center
                      text-[14px]
                      font-semibold
                      text-zinc-950
                      outline-none
                    "
                  />

                  <button
                    type="button"
                    onClick={() => changeQuantity(1)}
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-[10px]
                      text-zinc-500
                      transition

                      hover:bg-black/[0.04]
                      hover:text-zinc-950
                    "
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Order form */}
              <form
                onSubmit={handleSubmit}
                className="
                  relative
                  mt-6
                  space-y-4
                  border-t
                  border-black/[0.06]
                  pt-5
                "
              >
                <div
                  className="
                    grid
                    gap-3

                    sm:grid-cols-2
                  "
                >
                  <FormField
                    label="Nom complet"
                    name="fullName"
                    value={orderForm.fullName}
                    onChange={handleChange}
                    placeholder="Votre nom"
                    autoComplete="name"
                    required
                  />

                  <FormField
                    label="Téléphone"
                    name="phoneNumber"
                    type="tel"
                    value={orderForm.phoneNumber}
                    onChange={handleChange}
                    placeholder="0550 00 00 00"
                    autoComplete="tel"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="order-address"
                    className="
                      block
                      text-[12px]
                      font-medium
                      text-zinc-600
                    "
                  >
                    Adresse de livraison
                  </label>

                  <textarea
                    id="order-address"
                    name="address"
                    value={orderForm.address}
                    onChange={handleChange}
                    placeholder="Wilaya, commune, adresse..."
                    rows={3}
                    autoComplete="street-address"
                    required
                    className="
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-black/[0.09]
                      bg-white/80
                      px-3.5
                      py-3
                      text-[14px]
                      text-zinc-950
                      outline-none
                      transition-[border-color,background-color,box-shadow]
                      duration-200
                      placeholder:text-zinc-400

                      hover:border-black/[0.14]
                      hover:bg-white

                      focus:border-black/20
                      focus:bg-white
                      focus:ring-4
                      focus:ring-black/[0.035]
                    "
                  />
                </div>

                {/* Final summary */}
                <div
                  className="
                    rounded-[18px]
                    border
                    border-black/[0.06]
                    bg-black/[0.025]
                    p-4
                  "
                >
                  <PriceRow
                    label={`${quantity} × Produit`}
                    value={
                      orderSubtotal > 0
                        ? `${formatPrice(orderSubtotal)} DA`
                        : "Sur demande"
                    }
                  />

                  <PriceRow
                    label="Livraison"
                    value={
                      orderShipping > 0
                        ? `${formatPrice(orderShipping)} DA`
                        : "À confirmer"
                    }
                  />

                  <div
                    className="
                      mt-3
                      flex
                      items-end
                      justify-between
                      gap-3
                      border-t
                      border-black/[0.06]
                      pt-3
                    "
                  >
                    <span
                      className="
                        text-[13px]
                        font-semibold
                        text-zinc-800
                      "
                    >
                      Total
                    </span>

                    <span
                      className="
                        text-[20px]
                        font-semibold
                        tracking-[-0.02em]
                        text-zinc-950
                      "
                    >
                      {orderTotal > 0
                        ? `${formatPrice(orderTotal)} DA`
                        : "Sur demande"}
                    </span>
                  </div>
                </div>

                {submitError && (
                  <div
                    role="alert"
                    className="
                      rounded-xl
                      border
                      border-red-200/80
                      bg-red-50/90
                      px-3
                      py-2.5
                      text-[12px]
                      leading-5
                      text-red-800
                    "
                  >
                    {submitError}
                  </div>
                )}

                {submitMessage && (
                  <div
                    role="status"
                    className="
                      flex
                      items-start
                      gap-2
                      rounded-xl
                      border
                      border-emerald-200/80
                      bg-emerald-50/80
                      px-3
                      py-2.5
                      text-[12px]
                      leading-5
                      text-emerald-800
                    "
                  >
                    <Check size={14} className="mt-0.5 shrink-0" />

                    {submitMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="
                    flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-zinc-950
                    px-5
                    text-[14px]
                    font-semibold
                    text-white
                    shadow-xs
                    transition
                    duration-200

                    hover:bg-zinc-800

                    active:scale-[0.99]

                    focus-visible:outline-none
                    focus-visible:ring-4
                    focus-visible:ring-black/10

                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <ShoppingBag size={15} strokeWidth={1.8} />

                  {submitting ? "Envoi en cours..." : "Commander maintenant"}
                </button>

                <p
                  className="
                    text-center
                    text-[11px]
                    leading-5
                    text-zinc-400
                  "
                >
                  Votre demande sera envoyée à l&apos;équipe San Water pour
                  confirmation.
                </p>
              </form>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Form field                                                                 */
/* -------------------------------------------------------------------------- */

function FormField({ label, ...props }) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={`order-${props.name}`}
        className="
          block
          text-[12px]
          font-medium
          text-zinc-600
        "
      >
        {label}
      </label>

      <input
        id={`order-${props.name}`}
        {...props}
        className="
          h-11
          w-full
          rounded-xl
          border
          border-black/[0.09]
          bg-white/80
          px-3.5
          text-[14px]
          text-zinc-950
          outline-none
          transition-[border-color,background-color,box-shadow]
          duration-200
          placeholder:text-zinc-400

          hover:border-black/[0.14]
          hover:bg-white

          focus:border-black/20
          focus:bg-white
          focus:ring-4
          focus:ring-black/[0.035]
        "
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Product metadata                                                           */
/* -------------------------------------------------------------------------- */

function ProductInfo({ label, value }) {
  return (
    <div
      className="
        rounded-[18px]
        border
        border-black/[0.06]
        bg-white/55
        px-4
        py-3.5
        backdrop-blur-xl
      "
    >
      <p
        className="
          text-[11px]
          font-medium
          text-zinc-400
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          truncate
          text-[13px]
          font-medium
          text-zinc-800
        "
      >
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Price row                                                                  */
/* -------------------------------------------------------------------------- */

function PriceRow({ label, value }) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-4
        py-1
      "
    >
      <span
        className="
          text-[12px]
          text-zinc-500
        "
      >
        {label}
      </span>

      <span
        className="
          text-[12px]
          font-medium
          text-zinc-800
        "
      >
        {value}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Loading skeleton                                                           */
/* -------------------------------------------------------------------------- */

function ProductSkeleton() {
  return (
    <div
      className="
        min-h-screen
        bg-[#f5f5f7]
        text-zinc-950
      "
    >
      <div
        className="
          mx-auto
          max-w-7xl
          animate-pulse
          px-4
          py-8

          sm:px-6
          lg:px-8
        "
      >
        <div className="mb-6 h-4 w-40 rounded bg-zinc-200/70" />

        <div
          className="
            grid
            gap-6

            lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]
            lg:gap-8
          "
        >
          <div>
            <div
              className="
                rounded-[30px]
                border
                border-black/[0.05]
                bg-white/60
                p-4
              "
            >
              <div
                className="
                  aspect-[4/3]
                  rounded-[24px]
                  bg-zinc-200/65
                "
              />

              <div className="mt-3 flex gap-2">
                <div className="h-16 w-16 rounded-[14px] bg-zinc-200/70" />
                <div className="h-16 w-16 rounded-[14px] bg-zinc-200/70" />
                <div className="h-16 w-16 rounded-[14px] bg-zinc-200/70" />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="h-[68px] rounded-[18px] bg-white/70" />
              <div className="h-[68px] rounded-[18px] bg-white/70" />
            </div>
          </div>

          <div
            className="
              rounded-[30px]
              border
              border-black/[0.05]
              bg-white/65
              p-6
            "
          >
            <div className="h-3 w-24 rounded bg-zinc-200" />

            <div className="mt-3 h-9 w-3/4 rounded bg-zinc-200" />

            <div className="mt-3 h-4 w-full rounded bg-zinc-100" />
            <div className="mt-2 h-4 w-4/5 rounded bg-zinc-100" />

            <div className="mt-6 h-24 rounded-[20px] bg-zinc-100" />

            <div className="mt-6 h-11 rounded-xl bg-zinc-100" />
            <div className="mt-3 h-11 rounded-xl bg-zinc-100" />
            <div className="mt-3 h-20 rounded-xl bg-zinc-100" />

            <div className="mt-5 h-12 rounded-xl bg-zinc-900/80" />
          </div>
        </div>
      </div>
    </div>
  );
}
