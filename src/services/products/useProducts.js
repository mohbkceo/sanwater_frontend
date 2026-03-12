import { useEffect, useState } from "react";
import { getProducts } from "./productServices";

export default function useProducts() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    async function fetchProducts() {
        try {
            setLoading(true)
            const data = await getProducts();

            setProducts(data.data.products);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProducts();
    }, []);

    return { products, loading, refetch: fetchProducts };
}