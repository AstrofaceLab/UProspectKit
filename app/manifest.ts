import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UProspectKit",
    short_name: "UProspectKit",
    description: "AI-Powered Upwork Proposal Generator",
    start_url: "/",
    display: "standalone",
    background_color: "#0f0e0d",
    theme_color: "#83ff00",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
