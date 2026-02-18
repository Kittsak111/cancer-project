"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// กำหนด type ให้ถูกต้อง
type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}