import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProductForm from "../src/components/products/ProductForm";

const mocks = vi.hoisted(() => ({
  createProduct: vi.fn(),
  getFamilies: vi.fn(),
}));

vi.mock("../src/lib/i18n", () => ({ useTranslation: () => ({ t: (key) => key.split(".").at(-1) }) }));
vi.mock("../src/lib/intelligenceCopy", () => ({ useIntelligenceCopy: () => (value) => value }));
vi.mock("../src/services/products/productServices", () => ({
  createProduct: mocks.createProduct,
  updateProduct: vi.fn(),
}));
vi.mock("../src/services/products/familyServices", () => ({
  getFamilies: mocks.getFamilies,
  createFamily: vi.fn(),
  createSubFamily: vi.fn(),
}));
vi.mock("../src/components/products/ProductGalleryUpload", () => ({ default: () => <div>Gallery upload</div> }));
vi.mock("../src/components/index.js", () => ({ Button: (props) => <button {...props} /> }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("admin product editor", () => {
  it("creates a product without entering a serial number or SEO data", async () => {
    mocks.getFamilies.mockResolvedValue({ data: { families: [] } });
    mocks.createProduct.mockResolvedValue({ data: { serialNumber: "product_created123" } });
    const { container } = render(<MemoryRouter><ProductForm /></MemoryRouter>);

    expect(container.querySelector('details#seo').open).toBe(false);
    expect(container.querySelector('input[name="serialNumber"]')).toBeNull();
    fireEvent.change(container.querySelector('input[name="name"]'), { target: { value: "Brass mixer" } });
    fireEvent.change(container.querySelector('input[name="productId"]'), { target: { value: "BM-10" } });
    fireEvent.change(container.querySelector('input[name="productPrice"]'), { target: { value: "1500" } });
    fireEvent.click(screen.getAllByRole("button", { name: "create_product" })[0]);

    await waitFor(() => expect(mocks.createProduct).toHaveBeenCalledOnce());
    const payload = mocks.createProduct.mock.calls[0][0];
    expect(payload).toMatchObject({ name: "Brass mixer", productId: "BM-10", status: "draft", isActive: false, prices: { productPrice: 1500, shippingPrice: 0 } });
    expect(payload).not.toHaveProperty("serialNumber");
    expect(payload).not.toHaveProperty("seo");
    expect(mocks.getFamilies).toHaveBeenCalledOnce();
  });
});
