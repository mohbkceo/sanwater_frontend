import ProductForm from "@/components/products/ProductForm";
import GoBacKButton from "@/components/shared_uis/gobackbutton";

export default function CreateProductPage() {

    return (

        <div className="p-6 flex w-[50%] max-sm:w-full gap-2 flex-col mx-auto">

           
            <GoBacKButton />
            <ProductForm />

        </div>

    );
}