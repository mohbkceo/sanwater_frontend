import { useTranslation } from "@/lib/i18n";
import ProductForm from "@/components/products/ProductForm";
import GoBacKButton from "@/components/shared_uis/gobackbutton";

export default function CreateProductPage() {
  const { t } = useTranslation();

    return (

        <div className="mx-auto w-full max-w-[1640px] px-3 py-6 sm:px-6">

            <GoBacKButton text={t("admin.common.back")} />
            <ProductForm />

        </div>

    );
}
