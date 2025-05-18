"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";

const ErudaProvider = dynamic(
  () => import("./Eruda").then((c) => c.ErudaProvider),
  {
    ssr: false,
  }
);

export default function ClientProviders({ children }: { children: ReactNode }) {
  return <ErudaProvider>{children}</ErudaProvider>;
}
