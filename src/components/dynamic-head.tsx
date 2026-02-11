"use client";
import { useEffect } from "react";
import { getFavicon, getSiteTitle, getMetaDescription } from "@/lib/content-manager";

export default function DynamicHead() {
  useEffect(() => {
    const apply = async () => {
      const fav = await getFavicon();
      if (fav) {
        let link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
        if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
        link.href = fav;
        let apple = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
        if (!apple) { apple = document.createElement("link"); apple.rel = "apple-touch-icon"; document.head.appendChild(apple); }
        apple.href = fav;
      }
      const title = await getSiteTitle();
      if (title) document.title = title;
      const description = await getMetaDescription();
      let metaDesc = document.querySelector("meta[name='description']") as HTMLMetaElement;
      if (!metaDesc) { metaDesc = document.createElement("meta"); metaDesc.name = "description"; document.head.appendChild(metaDesc); }
      metaDesc.content = description || "";
    };
    apply();
  }, []);

  return null;
}
