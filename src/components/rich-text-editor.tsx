"use client";
import { useRef, useCallback, useEffect } from "react";
import { Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Link, Image, AlignLeft, AlignCenter, AlignRight, Minus, Undo, Redo, Type, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

interface ToolbarBtn {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  action: () => void;
  separator?: false;
}

interface ToolbarSep {
  separator: true;
}

type ToolbarItem = ToolbarBtn | ToolbarSep;

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // Editor'a dışarıdan gelen value'yu yaz (sadece ilk yükleme veya dışarıdan değişim)
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const exec = useCallback((command: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    // Değişikliği raporla
    isInternalChange.current = true;
    onChange(editorRef.current?.innerHTML || "");
  }, [onChange]);

  const handleInput = useCallback(() => {
    isInternalChange.current = true;
    onChange(editorRef.current?.innerHTML || "");
  }, [onChange]);

  const insertLink = useCallback(() => {
    const url = prompt("Link URL'sini girin:", "https://");
    if (url) exec("createLink", url);
  }, [exec]);

  const insertImage = useCallback(() => {
    // Dosya seçici
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target?.result as string;
          exec("insertHTML", `<img src="${dataUrl}" alt="Blog görseli" style="max-width:100%;border-radius:8px;margin:12px 0" />`);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [exec]);

  const insertHR = useCallback(() => {
    exec("insertHTML", "<hr/>");
  }, [exec]);

  const setFontSize = useCallback((size: string) => {
    exec("fontSize", size);
  }, [exec]);

  const setColor = useCallback(() => {
    const color = prompt("Renk kodu girin (örn: #ff0000 veya red):", "#000000");
    if (color) exec("foreColor", color);
  }, [exec]);

  const formatBlock = useCallback((tag: string) => {
    exec("formatBlock", tag);
  }, [exec]);

  const toolbarItems: ToolbarItem[] = [
    { icon: Undo, title: "Geri Al", action: () => exec("undo") },
    { icon: Redo, title: "İleri Al", action: () => exec("redo") },
    { separator: true },
    { icon: Heading1, title: "Başlık 1", action: () => formatBlock("h2") },
    { icon: Heading2, title: "Başlık 2", action: () => formatBlock("h3") },
    { icon: Heading3, title: "Başlık 3", action: () => formatBlock("h4") },
    { icon: Type, title: "Normal Metin", action: () => formatBlock("p") },
    { separator: true },
    { icon: Bold, title: "Kalın", action: () => exec("bold") },
    { icon: Italic, title: "İtalik", action: () => exec("italic") },
    { icon: Underline, title: "Altı Çizili", action: () => exec("underline") },
    { icon: Strikethrough, title: "Üstü Çizili", action: () => exec("strikeThrough") },
    { separator: true },
    { icon: Palette, title: "Yazı Rengi", action: setColor },
    { separator: true },
    { icon: AlignLeft, title: "Sola Hizala", action: () => exec("justifyLeft") },
    { icon: AlignCenter, title: "Ortala", action: () => exec("justifyCenter") },
    { icon: AlignRight, title: "Sağa Hizala", action: () => exec("justifyRight") },
    { separator: true },
    { icon: List, title: "Madde İşareti", action: () => exec("insertUnorderedList") },
    { icon: ListOrdered, title: "Numaralı Liste", action: () => exec("insertOrderedList") },
    { icon: Quote, title: "Alıntı", action: () => formatBlock("blockquote") },
    { separator: true },
    { icon: Link, title: "Link Ekle", action: insertLink },
    { icon: Image, title: "Görsel Ekle", action: insertImage },
    { icon: Minus, title: "Yatay Çizgi", action: insertHR },
  ];

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 bg-muted/50 border-b">
        {toolbarItems.map((item, i) => {
          if ("separator" in item && item.separator) {
            return <div key={`sep-${i}`} className="w-px h-6 bg-border mx-1" />;
          }
          const btn = item as ToolbarBtn;
          return (
            <Button
              key={btn.title}
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={btn.action}
              title={btn.title}
            >
              <btn.icon className="h-4 w-4" />
            </Button>
          );
        })}
        {/* Font Size Dropdown */}
        <div className="w-px h-6 bg-border mx-1" />
        <select
          className="h-8 text-xs bg-transparent border rounded px-1 outline-none cursor-pointer"
          onChange={e => { setFontSize(e.target.value); e.target.value = ""; }}
          defaultValue=""
          title="Yazı Boyutu"
        >
          <option value="" disabled>Boyut</option>
          <option value="1">Küçük</option>
          <option value="3">Normal</option>
          <option value="4">Orta</option>
          <option value="5">Büyük</option>
          <option value="6">Çok Büyük</option>
        </select>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="min-h-[400px] max-h-[600px] overflow-y-auto p-4 outline-none text-sm leading-relaxed
          [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-6 [&>h2]:mb-3
          [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-5 [&>h3]:mb-2
          [&>h4]:text-lg [&>h4]:font-medium [&>h4]:mt-4 [&>h4]:mb-2
          [&>p]:mb-3 [&>p]:leading-relaxed
          [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-muted-foreground [&>blockquote]:my-4
          [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:my-3
          [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:my-3
          [&_li]:mb-1
          [&>hr]:my-6 [&>hr]:border-border
          [&_a]:text-primary [&_a]:underline
          [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-4"
        onInput={handleInput}
        onPaste={(e) => {
          // Yapıştırılan içerikten sadece metni al (biçimlendirme temizle - isteğe bağlı)
          // Burada HTML yapıştırmayı koruyoruz
        }}
        data-placeholder={placeholder || "Yazınızı buraya yazın..."}
        style={{ position: "relative" }}
      />

    </div>
  );
}
