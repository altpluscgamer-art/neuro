"use client";

import { useEffect, useState } from "react";
import { sanitizeHtml } from "@/lib/sanitize";

interface AdBlockProps {
  position: "header" | "sidebar" | "article" | "footer";
}

interface AdSettings {
  ads_yandex_enabled: string | null;
  ads_yandex_rtb_id: string | null;
  ads_google_enabled: string | null;
  ads_google_ad_slot: string | null;
  ads_custom_html: string | null;
}

export default function AdBlock({ position }: AdBlockProps) {
  const [settings, setSettings] = useState<AdSettings | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        const mapped: AdSettings = {
          ads_yandex_enabled: data.ads_yandex_enabled ?? null,
          ads_yandex_rtb_id: data.ads_yandex_rtb_id ?? null,
          ads_google_enabled: data.ads_google_enabled ?? null,
          ads_google_ad_slot: data.ads_google_ad_slot ?? null,
          ads_custom_html: data.ads_custom_html ?? null,
        };
        setSettings(mapped);
      })
      .catch(() => {});
  }, []);

  if (!settings) return null;

  if (settings.ads_custom_html) {
    return (
      <div data-ad-position={position}>
        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(settings.ads_custom_html) }} />
      </div>
    );
  }

  if (settings.ads_yandex_enabled === "true" && settings.ads_yandex_rtb_id) {
    return (
      <div data-ad-position={position}>
        <div id={`yandex_rtb_${settings.ads_yandex_rtb_id}_${position}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,n,s,t){w[n]=w[n]||[];w[n].push(function(){Ya.Context.AdvManager.render({blockId:"${settings.ads_yandex_rtb_id}",renderTo:"yandex_rtb_${settings.ads_yandex_rtb_id}_${position}",async:true})});t=d.getElementsByTagName("script")[0];s=d.createElement("script");s.type="text/javascript";s.src="//an.yandex.ru/system/context.js";s.async=true;t.parentNode.insertBefore(s,t)})(this,this.document,"yandexContextAsyncCallbacks");`,
          }}
        />
      </div>
    );
  }

  if (settings.ads_google_enabled === "true" && settings.ads_google_ad_slot) {
    return (
      <div data-ad-position={position}>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-placeholder"
          data-ad-slot={settings.ads_google_ad_slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  return null;
}
