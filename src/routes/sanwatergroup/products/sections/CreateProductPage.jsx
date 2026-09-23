import { useTranslation } from "@/lib/i18n";
import ProductForm from "@/components/products/ProductForm";
import GoBacKButton from "@/components/shared_uis/gobackbutton";

export default function CreateProductPage() {
  const { t } = useTranslation();

    return (

        <div className="p-6 flex w-[50%] max-sm:w-full gap-2 flex-col mx-auto">

            <GoBacKButton text={t("admin.common.back")} />

              <header className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-800">{t("admin.products.create_new_product")}</h2>
                    <p className="text-slate-500 text-sm">{t("admin.products.fill_in_the_details_below_to_add_a_new")}</p>
                </header>
            <ProductForm />

        </div>

    );
}
