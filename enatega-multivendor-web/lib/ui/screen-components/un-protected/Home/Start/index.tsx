"use client";

import React from "react";
import { useRouter } from "next/navigation";

// Components
import HomeSearch from "@/lib/ui/useable-components/Home-search";
import TextFlyingAnimation from "@/lib/ui/useable-components/FlyingText";

// Hooks
import useLocation from "@/lib/hooks/useLocation";
import useSetUserCurrentLocation from "@/lib/hooks/useSetUserCurrentLocation";
import LoginInForSavedAddresses from "@/lib/ui/useable-components/LoginForSavedAddresses";

// imports related to auth module
import AuthModal from "../../authentication";
import { useAuth } from "@/lib/context/auth/auth.context";
import { useTranslations } from "next-intl";

const Start: React.FC = () => {
  // Hooks
  const router = useRouter();
  const { getCurrentLocation } = useLocation();
  const { onSetUserLocation } = useSetUserCurrentLocation();
  const { isAuthModalVisible, setIsAuthModalVisible, setActivePanel } =
    useAuth();

  const handleModalToggle = () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!token || !userId) {
      setIsAuthModalVisible((prev) => {
        if (prev) {
          setActivePanel(0);
        }
        return !prev;
      });
    } else {
      router.push("/profile/addresses");
    }
  };
  const t = useTranslations();

  return (
    <div
      className="h-[100vh] w-full bg-cover bg-center flex items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #0f172a 0%, #1e293b 28%, #312e81 55%, #5b21b6 85%, #7c3aed 100%)",
        boxShadow: "inset 0 0 120px rgba(0,0,0,0.25)",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(201,162,39,0.12),transparent)] pointer-events-none" aria-hidden />
      <div className="text-center flex flex-col items-center justify-center relative z-10">
        <TextFlyingAnimation />
        <h1 className="text-[40px] md:text-[90px] font-extrabold text-white drop-shadow-lg" style={{ textShadow: "0 0 40px rgba(201,162,39,0.25)" }}>
          {t("delivered_heading")}
        </h1>
        <HomeSearch />
        <div className="my-6 text-white flex items-center justify-center">
          <div className="flex items-center gap-2">
            <i
              className="pi pi-map-marker"
              style={{ fontSize: "1rem", color: "white" }}
            ></i>
            <button
              className="me-2 underline"
              onClick={() => {
                getCurrentLocation(onSetUserLocation);
                router.push("/discovery");
              }}
            >
              {t("LoginForSavedAddresses.currentlocation")}
            </button>
          </div>
          <LoginInForSavedAddresses handleModalToggle={handleModalToggle} />
        </div>
      </div>

      <svg
        viewBox="0 0 1000 200"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-full h-[100px] "
      >
        <path
          d="M0,100 C500,60 500,60 1000,100 L1000,200 L0,200 Z"
          fill="white"
          className="block dark:hidden"
        />
        <path
          d="M0,100 C500,60 500,60 1000,100 L1000,200 L0,200 Z"
          fill="#0f172a"
          className="hidden dark:block"
        />
      </svg>

      <AuthModal
        handleModalToggle={handleModalToggle}
        isAuthModalVisible={isAuthModalVisible}
      />
    </div>
  );
};

export default Start;
