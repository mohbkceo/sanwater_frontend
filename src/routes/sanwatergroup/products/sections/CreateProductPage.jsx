import ProductForm from "@/components/products/ProductForm";
import GoBacKButton from "@/components/shared_uis/gobackbutton";

export default function CreateProductPage() {

    return (

        <div className="p-6 flex w-[50%] max-sm:w-full gap-2 flex-col mx-auto">

            <GoBacKButton />

              <header className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-800">Create New Product</h2>
                    <p className="text-slate-500 text-sm">Fill in the details below to add a new item to your inventory.</p>
                </header>
            <ProductForm />

        </div>

    );
}