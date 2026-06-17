"use client";

import { Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { QRLayoutDesigner, type StickerLayout } from "qrlayout-ui";
import { DEFAULT_NEW_LAYOUT, ENTITY_SCHEMAS } from "@/lib/schemas";
import { storage } from "@/lib/storage";

function DesignerContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const designerRef = useRef<QRLayoutDesigner | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const layoutId = searchParams.get("id");

  useEffect(() => {
    storage.initializeDefaults();
    if (!containerRef.current) return;

    const existing = layoutId
      ? storage.getLabels().find((l) => l.id === layoutId)
      : undefined;

    const initialLayout: StickerLayout =
      existing ??
      ({
        ...DEFAULT_NEW_LAYOUT,
        id: crypto.randomUUID(),
      } as StickerLayout);

    designerRef.current = new QRLayoutDesigner({
      element: containerRef.current,
      entitySchemas: ENTITY_SCHEMAS,
      initialLayout,
      onSave: (layout) => {
        storage.addLabel(layout);
        router.push("/labels");
      },
    });

    return () => {
      designerRef.current?.destroy();
      designerRef.current = null;
    };
  }, [layoutId, router]);

  return (
    <div className="relative h-screen w-full">
      <Link
        href="/labels"
        className="fixed left-4 top-4 z-[9999] flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 shadow-md transition-all hover:bg-gray-100"
      >
        <ArrowLeft size={18} />
        Back to Labels
      </Link>
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}

export function DesignerPageClient() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-gray-500">
          Loading designer...
        </div>
      }
    >
      <DesignerContent />
    </Suspense>
  );
}
