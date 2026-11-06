import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "id.sch.sdnkaliwungu05.elibceria",
  appName: "E-Library Ceria",
  webDir: "public",
  server: {
    url: "https://elibceria.vercel.app",
    cleartext: true,
    androidScheme: "https",
  },
  android: {
    allowMixedContent: true,
    backgroundColor: "#FFFDF8",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#FFFDF8",
      androidScaleType: "CENTER_INSIDE",
      showSpinner: false,
    },
  },
};

export default config;

