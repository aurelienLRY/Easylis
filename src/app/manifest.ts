import type { MetadataRoute } from "next";

export default function Manifeste(): MetadataRoute.Manifest {
  return {
    name: "EasyLis",
    short_name: "EasyLis",
    description:
      "Application de gestion de réservation d'activités de pleine nature",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "rgb(15 23 42 / 60%)",
    theme_color: "rgb(15 23 42 / 60%)",
    icons: [
      // iOS Icons
      {
        src: "/AppImages/ios/1024.png",
        sizes: "1024x1024",
        type: "image/png",
      },
      {
        src: "/AppImages/ios/512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/AppImages/ios/192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/AppImages/ios/180.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/AppImages/ios/167.png",
        sizes: "167x167",
        type: "image/png",
      },
      {
        src: "/AppImages/ios/152.png",
        sizes: "152x152",
        type: "image/png",
      },
      {
        src: "/AppImages/ios/144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        src: "/AppImages/ios/120.png",
        sizes: "120x120",
        type: "image/png",
      },

      // Android Icons
      {
        src: "/AppImages/android/android-launchericon-512-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/AppImages/android/android-launchericon-192-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/AppImages/android/android-launchericon-144-144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/AppImages/android/android-launchericon-96-96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/AppImages/android/android-launchericon-72-72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/AppImages/android/android-launchericon-48-48.png",
        sizes: "48x48",
        type: "image/png",
        purpose: "maskable",
      },

      // Windows Icons
      {
        src: "/AppImages/windows11/Square44x44Logo.scale-400.png",
        sizes: "176x176",
        type: "image/png",
      },
      {
        src: "/AppImages/windows11/Square150x150Logo.scale-200.png",
        sizes: "300x300",
        type: "image/png",
      },
      {
        src: "/AppImages/windows11/Square44x44Logo.targetsize-256.png",
        sizes: "256x256",
        type: "image/png",
      },
    ],
    screenshots: [
      {
        src: "/splash_screens/iPhone_16_Pro_Max_portrait.png",
        sizes: "440x956",
        type: "image/png",
        form_factor: "narrow",
      },
      {
        src: "/splash_screens/12.9__iPad_Pro_portrait.png",
        sizes: "1024x1366",
        type: "image/png",
        form_factor: "wide",
      },
    ],
    prefer_related_applications: false,
    categories: ["business", "productivity"],
    lang: "fr-FR",
    dir: "ltr",
  };
}
