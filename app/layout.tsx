"use client"

import type React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import "./globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Create a new QueryClient for each request
  const [queryClient] = useState(() => new QueryClient())

  return (
    <html lang="en">
      <QueryClientProvider client={queryClient}>
        <body>{children}</body>
      </QueryClientProvider>
    </html>
  )
}
