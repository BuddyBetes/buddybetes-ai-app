import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";

// Back on these routes exits the app instead of bouncing into auth redirects
const EXIT_ROUTES = ["/", "/dashboard", "/signin", "/admin/dashboard"];

const NativeBackButton = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const sub = CapApp.addListener("backButton", ({ canGoBack }) => {
      if (!canGoBack || EXIT_ROUTES.includes(pathname)) CapApp.exitApp();
      else navigate(-1);
    });

    return () => {
      sub.then((s) => s.remove());
    };
  }, [navigate, pathname]);

  return null;
};

export default NativeBackButton;