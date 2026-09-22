import { useState } from "react";
import { getProducts } from "./productServices";

export default function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [hasMore, setHasMore] = useState(true);
  const [nextLastId, setNextLastId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const refetch = async (params = {}, append = false) => {
    try {
      setLoading(true);

      const data = await getProducts(params);
      
      const incomingProducts = data?.data?.products || [];

      setProducts((prev) =>
        append ? [...prev, ...incomingProducts] : incomingProducts
      );

      setHasMore(data?.data?.hasMore ?? false);
      setNextLastId(data?.data?.nextLastId ?? null);
      setPage(data?.data?.page ?? 1);
      setTotalPages(data?.data?.totalPages ?? 1);
      setTotalCount(data?.data?.totalCount ?? incomingProducts.length);

      return data;
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    refetch,
    hasMore,
    nextLastId,
    page,
    totalPages,
    totalCount,
  };
}
