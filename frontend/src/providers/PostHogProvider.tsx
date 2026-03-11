"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

type Props = {
  children: React.ReactNode;
};

export default function PostHogClientProvider({ children }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

    if (key && host) {
      posthog.init(key, {
        api_host: host,
        capture_pageview: false,
      });
    }
  }, []);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    if (!key || !host) return;

    const url =
      pathname + (searchParams?.toString() ? `?${searchParams}` : "");
    posthog.capture("$pageview", { url });
  }, [pathname, searchParams]);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
