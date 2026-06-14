import { getProduct } from "@/services/products/productServices";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

export default function ProductPage() {
  const { serialNumber } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");

  const whatsappNumber = "213XXXXXXXXX"; // Ligne officielle du service client San Water

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await getProduct(serialNumber);
        const productData = res?.data;
        console.log(productData);
        setProduct(productData);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [serialNumber]);

  useEffect(() => {
    if (!product) return;

    const firstImage =
      product?.gallery?.[0] ||
      product?.image ||
      product?.thumbnail ||
      "";

    setSelectedImage(firstImage);
  }, [product]);

  const images = product?.gallery?.length ? product.gallery : [];

  const productPrice = Number(product?.prices?.productPrice || 0);
  const shippingPrice = Number(product?.prices?.shippingPrice || 0);
  const totalPrice = productPrice + shippingPrice;

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-US").format(Number(value || 0));

  const whatsappMessage = useMemo(() => {
    const name = product?.name || "Raccord San Water";
    const serial = product?.serialNumber || serialNumber || "-";
    const family = product?.family || "Accessoires de salle de bain";
    const price = productPrice > 0 ? `${formatPrice(productPrice)} DA` : "Devis requis";

    return encodeURIComponent(
      `Bonjour l'équipe commerciale San Water,\n\n` +
      `Je suis intéressé par ce raccord contemporain de votre catalogue :\n\n` +
      `• Nom du produit : ${name}\n` +
      `• Numéro de série : ${serial}\n` +
      `• ID de référence : ${product?.productId || "-"}\n` +
      `• Collection de design : ${family}\n` +
      `• Prix de base : ${price}\n` +
      `• Livraison / transport : ${shippingPrice > 0 ? `${formatPrice(shippingPrice)} DA` : "À confirmer lors de la commande"}\n\n` +
      `Veuillez confirmer la disponibilité du stock ainsi que les options de finition contemporaines pour cette pièce architecturale.`
    );
  }, [product, productPrice, shippingPrice, serialNumber]);

  const handleOrder = () => {
    const phone = String(whatsappNumber).replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${whatsappMessage}`, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return <ProductSkeleton />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 text-gray-900">
        <div className="max-w-md w-full rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">Produit introuvable</h2>
          <p className="mt-3 text-gray-500 text-sm">
            Le raccord San Water demandé n'a pas pu être chargé. Veuillez vérifier le numéro de série ou contacter notre service d'assistance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased">
      {/* Fil d’Ariane / Barre méta */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 flex flex-wrap gap-2 items-center text-xs font-medium text-gray-500">
          <span>Catalogue</span>
          <span className="text-gray-300">/</span>
          <span>{product.family || "Raccords"}</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 truncate">{product.name}</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Mise en page e-commerce principale en deux colonnes */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* Colonne gauche : visuel et informations techniques */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              {/* Vue principale de l'image */}
              <div className="overflow-hidden rounded-xl bg-gray-50 border border-gray-100 relative aspect-square lg:aspect-[4/3]">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={`${product.name} - San Water`}
                    className="h-full w-full object-cover object-center transition duration-300"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400 text-sm">
                    Aucune image d'aperçu disponible
                  </div>
                )}

                {/* Badges sur l'image */}
                <div className="absolute left-4 top-4 flex flex-col gap-2">
                  <span className="rounded-md bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-gray-800 shadow-sm border border-gray-200/50">
                    Laiterie premium
                  </span>
                  {product.tags?.[0] && (
                    <span className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                      {product.tags[0]}
                    </span>
                  )}
                </div>
              </div>

              {/* Conteneur horizontal des miniatures */}
              {images.length > 0 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(img)}
                      className={`relative h-20 w-20 min-w-[5rem] overflow-hidden rounded-xl border transition-all duration-200 ${
                        selectedImage === img
                          ? "border-emerald-600 ring-2 ring-emerald-600/10"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Vue San Water ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Section des indicateurs de qualité */}
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard title="Intégrité du matériau" value="Laiton massif / alliage de luxe" />
              <StatCard title="Profil de finition" value="Polissage haute précision" />
              <StatCard title="Langage de design" value="Contemporain minimaliste" />
              <StatCard title="Garantie San Water" value="Couverture complète de l'entreprise" />
            </div>

            {/* Bloc des spécifications techniques */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Spécifications techniques
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <DetailItem label="Référence catalogue" value={product.productId} />
                <DetailItem label="Numéro de série de fabrication" value={product.serialNumber} />
                <DetailItem label="Famille de l'écosystème" value={product.family || "Accessoires"} />
                <DetailItem label="État du stock" value={product.isActive ? "En stock usine" : "Commande spéciale uniquement"} />
                <DetailItem label="Contrôle qualité" value={product.author || "QA validé"} />
                <DetailItem
                  label="Date de lancement"
                  value={new Date(product.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                />
              </div>
            </div>

            {/* Tags du produit */}
            {product.tags?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Tags du produit</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Colonne droite : bloc d'achat et détails commerciaux */}
          <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              
              {/* Informations principales */}
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                  San Water Premium
                </span>
                <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                  {product.name}
                </h1>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge>Raccord original</Badge>
                  <Badge>N° S : {product.serialNumber}</Badge>
                </div>
              </div>

              {/* Grille de prix claire */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Prix de vente (PVC)</span>
                  <span className="text-xl font-bold text-gray-900">
                    {productPrice > 0 ? `${formatPrice(productPrice)} DA` : "Sur demande"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Livraison sécurisée</span>
                  <span className="text-gray-700 font-medium">
                    {shippingPrice > 0 ? `${formatPrice(shippingPrice)} DA` : "Calculé au paiement"}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                  <span className="text-base font-semibold text-gray-900">Total estimé</span>
                  <span className="text-2xl font-black text-emerald-700">
                    {totalPrice > 0 ? `${formatPrice(totalPrice)} DA` : "En attente de configuration"}
                  </span>
                </div>
              </div>

              {/* Description brève */}
              <p className="text-sm leading-relaxed text-gray-600 mb-6">
                {product.description ||
                  "Conçu avec un savoir-faire de niveau international et une esthétique européenne minimaliste. Cette pièce signature propose une finition luxueuse multicouche, un contrôle fluide de la distribution d'eau et des valves internes résistantes à la corrosion, adaptées aux salles de bain contemporaines haut de gamme."}
              </p>

              {/* Bloc de commande WhatsApp */}
              <div className="border-t border-gray-100 pt-6">
                <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-100 mb-4">
                  <h4 className="text-sm font-bold text-emerald-800">Vente directe et expédition showroom</h4>
                  <p className="mt-1 text-xs text-emerald-700/90 leading-normal">
                    Validez votre commande instantanément en envoyant ce bloc de spécifications directement à un représentant San Water. Nous gérons les variantes de finition personnalisées, la logistique prioritaire et la facturation entreprise.
                  </p>
                </div>

                <button
                  onClick={handleOrder}
                  className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 text-base font-bold transition duration-150 shadow-md hover:shadow-lg transform active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <span>Commander via WhatsApp Concierge</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Composants UI modernes, sobres et nets
function Badge({ children }) {
  return (
    <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-600 border border-gray-200">
      {children}
    </span>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{title}</div>
      <div className="mt-1 text-sm font-semibold text-gray-800">{value}</div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-gray-900 truncate">{value || "—"}</div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased">
      <div className="bg-white border-b border-gray-200 h-12 animate-pulse" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <div className="aspect-[4/3] rounded-xl bg-gray-200 w-full" />
              <div className="flex gap-3 mt-4">
                <div className="h-20 w-20 rounded-xl bg-gray-200" />
                <div className="h-20 w-20 rounded-xl bg-gray-200" />
                <div className="h-20 w-20 rounded-xl bg-gray-200" />
              </div>
            </div>
            <div className="h-32 bg-white rounded-2xl border border-gray-200" />
          </div>
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-10 bg-gray-200 rounded w-3/4" />
              <div className="h-24 bg-gray-100 rounded-xl" />
              <div className="h-12 bg-emerald-100 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}