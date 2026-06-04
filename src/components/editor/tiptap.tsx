"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef } from "react";
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Code, Image as ImgIcon, Link as LinkIcon, Undo, Redo } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RichEditor({ value, onChange, onAutosave }: { value: string; onChange: (html: string) => void; onAutosave?: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: { HTMLAttributes: { class: "rounded bg-muted p-3" } } }),
      Image.configure({ HTMLAttributes: { class: "rounded-lg" } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
      Placeholder.configure({ placeholder: "Start writing your story…" }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: { attributes: { class: "tiptap prose-content max-w-none" } },
    immediatelyRender: false,
  });

  const autosaveRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!onAutosave || !editor) return;
    if (autosaveRef.current) clearTimeout(autosaveRef.current);
    autosaveRef.current = setTimeout(() => onAutosave(editor.getHTML()), 2500);
    return () => { if (autosaveRef.current) clearTimeout(autosaveRef.current); };
  }, [value, editor, onAutosave]);

  if (!editor) return <div className="h-[480px] rounded-md border" />;

  const btn = (active: boolean, onClick: () => void, Icon: any) => (
    <Button type="button" size="icon" variant={active ? "secondary" : "ghost"} onClick={onClick}><Icon className="h-4 w-4" /></Button>
  );

  return (
    <div className="rounded-md border">
      <div className="flex flex-wrap items-center gap-1 border-b p-2">
        {btn(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), Bold)}
        {btn(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), Italic)}
        {btn(editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), Heading2)}
        {btn(editor.isActive("heading", { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), Heading3)}
        {btn(editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run(), List)}
        {btn(editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), ListOrdered)}
        {btn(editor.isActive("blockquote"), () => editor.chain().focus().toggleBlockquote().run(), Quote)}
        {btn(editor.isActive("codeBlock"), () => editor.chain().focus().toggleCodeBlock().run(), Code)}
        {btn(false, () => { const url = prompt("Image URL"); if (url) editor.chain().focus().setImage({ src: url }).run(); }, ImgIcon)}
        {btn(editor.isActive("link"), () => { const url = prompt("URL"); if (url) editor.chain().focus().setLink({ href: url }).run(); }, LinkIcon)}
        <div className="ml-auto flex">
          {btn(false, () => editor.chain().focus().undo().run(), Undo)}
          {btn(false, () => editor.chain().focus().redo().run(), Redo)}
        </div>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
