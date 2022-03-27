import type { API } from "./preload"
import "./index.css"

declare const api: typeof API;

(async function main() {
    const bookUrl: string | null = await api.loadBook();
    const iframe = document.createElement("iframe");
    if (bookUrl) {
        iframe.src = "../public/bibi/index.html?book=" + bookUrl;
    } else {
        iframe.src = "../public/bibi/index.html"
    }
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-popups");
    iframe.classList.add("bibi");
    document.body.append(iframe);
    setInterval(() => {
        const frameTitle = iframe.contentWindow.document.title ?? "No Title";
        const title = frameTitle.replace("EPUB Reader on your website.", "bi-epub-reader").replace("Published with Bibi", "bi-epub-reader");
        window.document.title = title;
    }, 1000)
    const onLoadIframe = () => {
        const iframeWindow = iframe.contentWindow as Window;
        console.log("loaded");
        iframeWindow.addEventListener("keyup", (event) => {
            const key = event.key;
            console.log(key);
        });
    }
    const nextPage = () => {
        const iframeWindow = iframe.contentWindow as any;
        console.log("test")
        if (iframeWindow.S["reader-view-mode"] === "paged") {
        }
    }
    window.addEventListener("keydown", (event) => {
        const key = event.key;
        if (key === " ") {
            nextPage();
        }
    });
})()
