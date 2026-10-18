"use client";

import NextLink, { type LinkProps as NextLinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

export type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> &
  Partial<NextLinkProps> & {
    to?: string | undefined;
    href?: string | undefined;
    params?: Record<string, string | number> | undefined;
    activeProps?: unknown | undefined;
    activeOptions?: unknown | undefined;
    children?: ReactNode;
  };

export function Link({
  to,
  href,
  params,
  activeProps: _activeProps,
  activeOptions: _activeOptions,
  children,
  ...props
}: LinkProps) {
  let destination = href || to || "/";
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      destination = destination.replace(`$${key}`, encodeURIComponent(String(value)));
    }
  }
  return (
    <NextLink href={destination} {...props}>
      {children}
    </NextLink>
  );
}

export default Link;
