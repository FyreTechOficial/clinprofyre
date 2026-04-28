"use client";

import { useState, useEffect, useRef } from "react";

const photoCache = new Map<string, string | null>();

export function useProfilePhotos(phones: string[], tenantId: string) {
  const [photos, setPhotos] = useState<Record<string, string | null>>({});
  const fetchedRef = useRef(new Set<string>());

  useEffect(() => {
    if (!tenantId || phones.length === 0) return;

    const toFetch = phones.filter((p) => !fetchedRef.current.has(p) && !photoCache.has(p));

    // Return cached immediately
    const cached: Record<string, string | null> = {};
    for (const p of phones) {
      if (photoCache.has(p)) cached[p] = photoCache.get(p)!;
    }
    if (Object.keys(cached).length > 0) {
      setPhotos((prev) => ({ ...prev, ...cached }));
    }

    // Fetch new ones (max 5 at a time to avoid spam)
    const batch = toFetch.slice(0, 5);
    for (const phone of batch) {
      fetchedRef.current.add(phone);
      fetch(`/api/whatsapp/profile-photo?phone=${phone}&tenant_id=${tenantId}`)
        .then((r) => r.json())
        .then((data) => {
          photoCache.set(phone, data.photoUrl);
          setPhotos((prev) => ({ ...prev, [phone]: data.photoUrl }));
        })
        .catch(() => {
          photoCache.set(phone, null);
        });
    }
  }, [phones.join(","), tenantId]);

  return photos;
}
