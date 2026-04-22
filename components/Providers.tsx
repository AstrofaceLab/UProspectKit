"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1e1c19",
            color: "#f0ebe3",
            border: "1px solid #2e2b26",
            borderRadius: "10px",
            fontFamily: "'Instrument Sans', sans-serif",
            fontSize: "13px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          },
          success: {
            iconTheme: {
              primary: "#e8a020",
              secondary: "#0f0e0d",
            },
          },
          error: {
            iconTheme: {
              primary: "#f87171",
              secondary: "#0f0e0d",
            },
          },
        }}
      />
    </SessionProvider>
  );
}
