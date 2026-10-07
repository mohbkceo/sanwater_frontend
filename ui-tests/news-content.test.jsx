import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import ArticleBody from "../src/components/news/blocks/ArticleBody";
import { ArticleImage, BlockAttributes, Callout, NewsColor, NewsHighlight, StructuredBlock } from "../src/components/news/editor/extensions";
import { youtubeId } from "../src/components/news/blocks/ContentBlock";
import { I18nProvider } from "../src/lib/i18n";
import RichTextEditor from "../src/components/news/RichTextEditor";

describe("News rich content", () => {
  it("recognizes supported YouTube URLs and rejects foreign hosts", () => {
    expect(youtubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(youtubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(youtubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(youtubeId("https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ")).toBe("");
  });

  it("loads legacy HTML and round trips controlled blocks", () => {
    const editor = new Editor({
      extensions: [StarterKit.configure({ heading: { levels: [2, 3, 4] } }), ArticleImage, BlockAttributes, NewsColor, NewsHighlight, StructuredBlock, Callout],
      content: '<h2>Legacy</h2><p>Existing article</p>',
    });
    expect(editor.getHTML()).toContain("Legacy");
    editor.commands.insertContent({ type: "structuredBlock", attrs: { type: "youtube", videoId: "dQw4w9WgXcQ", width: "wide" } });
    editor.commands.insertContent({ type: "callout", attrs: { calloutType: "tip" }, content: [{ type: "paragraph", content: [{ type: "text", text: "Useful detail" }] }] });
    editor.commands.insertContent({ type: "structuredBlock", attrs: { type: "product", payload: { id: "507f1f77bcf86cd799439011" } } });
    const html = editor.getHTML();
    expect(html).toContain('data-content-type="youtube"');
    expect(html).toContain('data-content-type="callout"');
    expect(html).toContain('data-content-type="product"');
    const loaded = new Editor({ extensions: [StarterKit.configure({ heading: { levels: [2, 3, 4] } }), ArticleImage, BlockAttributes, NewsColor, NewsHighlight, StructuredBlock, Callout], content: html });
    expect(loaded.getHTML()).toContain('data-video-id="dQw4w9WgXcQ"');
    expect(loaded.getHTML()).toContain('data-callout-type="tip"');
    expect(loaded.getHTML()).toContain('data-content-type="product"');
    editor.destroy();
    loaded.destroy();
  });

  it("renders safe video and responsive table while rejecting a fake video ID", () => {
    const article = { content: '<div data-content-type="youtube" data-video-id="dQw4w9WgXcQ"></div><div data-content-type="youtube" data-video-id="bad"></div><table><tbody><tr><td>Cell</td></tr></tbody></table><script>alert(1)</script><a href="javascript:alert(1)" onclick="alert(1)">Unsafe link</a>' };
    const { container } = render(<MemoryRouter><I18nProvider><ArticleBody article={article} /></I18nProvider></MemoryRouter>);
    expect(container.querySelectorAll("iframe")).toHaveLength(1);
    expect(container.querySelector("iframe").src).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(screen.getByText("Cell")).toBeTruthy();
    expect(container.querySelector(".news-table-scroll")).toBeTruthy();
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("[onclick]")).toBeNull();
    expect(container.querySelector('a[href^="javascript:"]')).toBeNull();
  });

  it("renders an inline product link and keyboard accessible accordion controls", () => {
    const productId = "507f1f77bcf86cd799439011";
    const product = { _id: productId, name: "Filter", serialNumber: "SW-1", shortDescription: "Clean water", gallery: [] };
    const content = `<div data-content-type="product" data-payload="${encodeURIComponent(JSON.stringify({ id: productId }))}"></div><div data-content-type="accordion" data-payload="${encodeURIComponent(JSON.stringify({ items: [{ title: "How?", answer: "Carefully." }] }))}"></div>`;
    render(<MemoryRouter><I18nProvider><ArticleBody article={{ content, inlineProducts: [product] }} preview /></I18nProvider></MemoryRouter>);
    expect(screen.getByText("Filter").closest("a").getAttribute("href")).toContain("SW-1");
    const toggle = screen.getByRole("button", { name: /How\?/ });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Carefully.")).toBeTruthy();
  });

  it("renders a representative mixed language article with every structured block", () => {
    const block = (type, value) => `<div data-content-type="${type}" data-payload="${encodeURIComponent(JSON.stringify(value))}"></div>`;
    const article = {
      inlineProducts: [{ _id: "507f1f77bcf86cd799439011", name: "Filter", serialNumber: "SW-1", gallery: [] }],
      content: '<h2>Heading</h2><p><strong>Bold</strong> <em>italic</em> <mark data-highlight="amber">highlight</mark></p><p dir="rtl">العربية</p><p dir="ltr">Français</p><div data-content-type="callout" data-callout-type="info"><p>Information</p></div><img src="https://example.com/image.jpg" alt="Image" data-caption="Caption"><div data-content-type="youtube" data-video-id="dQw4w9WgXcQ"></div><div data-content-type="youtube" data-video-id="dQw4w9WgXcQ"></div>' +
        block("gallery", { layout: "three", images: ["a", "b", "c"].map((name) => ({ src: `https://example.com/${name}.jpg`, alt: name })) }) +
        '<table><tbody><tr><td>Data</td></tr></tbody></table>' +
        block("quote", { quote: "Water matters", author: "Author" }) +
        block("product", { id: "507f1f77bcf86cd799439011" }) +
        block("stats", { items: [{ value: "15+", label: "Countries" }, { value: "98%", label: "Efficiency" }] }) +
        block("accordion", { items: [{ title: "Question", answer: "Answer" }] }) +
        block("cta", { label: "Contact", url: "/contact", style: "primary" }) +
        block("download", { title: "Brochure", url: "https://example.com/brochure.pdf", fileType: "PDF" }) +
        "<p>Last paragraph</p><hr>",
    };
    const { container } = render(<MemoryRouter><I18nProvider><ArticleBody article={article} preview /></I18nProvider></MemoryRouter>);
    expect(container.querySelectorAll("iframe")).toHaveLength(2);
    expect(container.querySelectorAll('img[loading="lazy"]')).toHaveLength(4);
    expect(container.querySelector('[dir="rtl"]')).toBeTruthy();
    expect(container.querySelector(".news-table-scroll")).toBeTruthy();
    expect(screen.getByText("Water matters", { exact: false })).toBeTruthy();
    expect(screen.getByText("Filter")).toBeTruthy();
    expect(screen.getByText("Countries")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Question/ })).toBeTruthy();
    expect(screen.getByText("Contact")).toBeTruthy();
    expect(screen.getByText("Brochure")).toBeTruthy();
  });

  it("loads legacy content and inserts a table through the editor", async () => {
    localStorage.setItem("lang", "en");
    let content = "";
    const { container } = render(<MemoryRouter><I18nProvider><RichTextEditor value="<p>Existing article</p>" onChange={(html) => { content = html; }} /></I18nProvider></MemoryRouter>);
    await waitFor(() => expect(container.querySelector(".ProseMirror")).toBeTruthy());
    expect(container.querySelector(".ProseMirror").textContent).toContain("Existing article");
    fireEvent.click(screen.getByRole("button", { name: "Table" }));
    await waitFor(() => expect(content).toContain("<table"));
  });

  it("converts a pasted YouTube URL into a controlled node", async () => {
    localStorage.setItem("lang", "en");
    let content = "";
    const { container } = render(<MemoryRouter><I18nProvider><RichTextEditor value="<p></p>" onChange={(html) => { content = html; }} /></I18nProvider></MemoryRouter>);
    await waitFor(() => expect(container.querySelector(".ProseMirror")).toBeTruthy());
    fireEvent.paste(container.querySelector(".ProseMirror"), { clipboardData: { files: [], getData: (type) => type === "text/plain" ? "https://www.youtube.com/shorts/dQw4w9WgXcQ" : "" } });
    await waitFor(() => expect(content).toContain('data-video-id="dQw4w9WgXcQ"'));
    expect(content).not.toContain("<iframe");
  });
});
