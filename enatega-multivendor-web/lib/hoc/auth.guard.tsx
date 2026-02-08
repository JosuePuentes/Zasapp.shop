"use client";
// Core
import { useLayoutEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

// Methods
import { onUseLocalStorage } from "../utils/methods/local-storage";

/** Rutas permitidas para usuario con role CLIENT (solo Marketplace, Carrito, Perfil) */
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

function isClientAllowedPath(pathname: string): boolean {
  const normalized = pathname.replace(/^\/(es|en)/, "") || "/";
  return CLIENT_ALLOWED_PATHS.some(
    (p) => normalized === p || normalized.startsWith(p + "/")
  );
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

        const userRole = onUseLocalStorage("get", "userRole");
        if (userRole === "CLIENT" && !isClientAllowedPath(pathname)) {
          setIsNavigating(false);
          router.replace("/");
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
