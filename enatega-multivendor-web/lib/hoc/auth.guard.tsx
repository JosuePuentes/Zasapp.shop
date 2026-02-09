"use client";
// Core
import { useLayoutEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

// Methods
import { onUseLocalStorage } from "../utils/methods/local-storage";

/** Rutas permitidas para usuario con role CLIENT (Marketplace, Carrito, Perfil) */
const CLIENT_ALLOWED_PATHS = [
  "/",
  "/profile",
  "/order",
  "/restaurants",
  "/store",
  "/discovery",
  "/search",
  "/category",
  "/mapview",
  "/see-all",
  "/about",
  "/terms",
  "/privacy",
];

/** Rutas permitidas para usuario con role DRIVER (panel conductor / rider) */
const DRIVER_ALLOWED_PATHS = ["/", "/profile", "/rider", "/order", "/about", "/terms", "/privacy"];

function normalizePath(pathname: string): string {
  return pathname.replace(/^\/(es|en)/, "") || "/";
}

function isAllowedPath(pathname: string, paths: string[]): boolean {
  const normalized = normalizePath(pathname);
  return paths.some((p) => normalized === p || normalized.startsWith(p + "/"));
}

const AuthGuard = <T extends object>(Component: React.ComponentType<T>) => {
  const WrappedComponent = (props: T) => {
    const [isNavigating, setIsNavigating] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const onHandleUserAuthenticate = () => {
      try {
        const authToken = onUseLocalStorage("get", "token");

        if (!authToken) {
          if (typeof document === "undefined" || typeof window === "undefined") {
            setIsNavigating(false);
            router.push("/");
            return;
          }
          const previousUrl = document.referrer;
          const isSameOrigin = previousUrl.startsWith(window.location.origin);
          const previousPath =
            isSameOrigin ? new URL(previousUrl).pathname : null;

          if (previousPath && previousPath !== pathname) {
            setIsNavigating(false);
            router.back();
          } else {
            setIsNavigating(false);
            router.push("/");
          }
          return;
        }

        const userRole = onUseLocalStorage("get", "userRole") || "CLIENT";
        if (userRole === "CLIENT" && !isAllowedPath(pathname, CLIENT_ALLOWED_PATHS)) {
          setIsNavigating(false);
          router.replace("/");
          return;
        }
        if (userRole === "DRIVER" && !isAllowedPath(pathname, DRIVER_ALLOWED_PATHS)) {
          setIsNavigating(false);
          router.replace("/rider");
          return;
        }

        setIsNavigating(false);
      } catch (err) {
        console.log(err);
        setIsNavigating(false);
        router.replace("/");
      }
    };

    useLayoutEffect(() => {
      onHandleUserAuthenticate();
    }, [pathname]);

    return isNavigating ? <></> : <Component {...props} />;
  };

  return WrappedComponent;
};

export default AuthGuard;
