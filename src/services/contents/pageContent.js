import { contentAPI } from "../baseAPIs";

export const getPageContent = async (slug) => {
  const response = await contentAPI.get(`/page_content/${slug}`);

  return response.data.data;
};

export const updatePageContent = async (slug, data) => {
  const response = await contentAPI.put(
    `/page_content/${slug}`,
    data
  );

  return response.data.data;
};