"use client";

import getEnv from "@/environment";
// GQL
import { GET_CONFIG } from "@/lib/api/graphql/queries";
import { ENV } from "@/lib/utils/constants";

// Interfaces
import { IConfigProps } from "@/lib/utils/interfaces";

// Apollo
import { useQuery } from "@apollo/client";
import { Libraries } from "@react-google-maps/api";

// Core
import React, { ReactNode, useContext } from "react";

const ConfigurationContext = React.createContext({} as IConfigProps);

export const ConfigurationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { loading, data, error } = useQuery(GET_CONFIG);

  const configuration =
    loading || error || !data?.configuration
      ? { currency: "", currencySymbol: "", deliveryRate: 0, costType: "perKM", skipEmailVerification: true, skipMobileVerification: true, testOtp: "123456" }
      : data.configuration;

  const GOOGLE_CLIENT_ID = configuration.webClientID ?? null;
  const STRIPE_PUBLIC_KEY = configuration.publishableKey ?? null;
  const PAYPAL_KEY = configuration.clientId ?? null;
  const GOOGLE_MAPS_KEY = configuration.googleApiKey ?? null;
  const AMPLITUDE_API_KEY = configuration.webAmplitudeApiKey ?? null;
  const LIBRARIES = "places,drawing,geometry".split(",") as Libraries;
  const COLORS = {
    GOOGLE: (configuration.googleColor as string) ?? "",
  };
  const SENTRY_DSN = configuration.webSentryUrl ?? null;
  const SKIP_EMAIL_VERIFICATION = configuration.skipEmailVerification ?? true;
  const SKIP_MOBILE_VERIFICATION = configuration.skipMobileVerification ?? true;
  const CURRENCY = configuration.currency ?? "";
  const CURRENCY_SYMBOL = configuration.currencySymbol ?? "";
  const DELIVERY_RATE = configuration.deliveryRate ?? 0;
  const COST_TYPE = configuration.costType ?? "perKM";
  const TEST_OTP = configuration.testOtp ?? "123456";

  const FIREBASE_KEY = configuration?.firebaseKey;
  const FIREBASE_PROJECT_ID = configuration?.projectId;
  const FIREBASE_STORAGE_BUCKET = configuration?.storageBucket;
  const FIREBASE_MSG_SENDER_ID = configuration?.msgSenderId;
  const FIREBASE_APP_ID = configuration?.appId;
  const FIREBASE_MEASUREMENT_ID = configuration?.measurementId;
  const FIREBASE_VAPID_KEY = configuration?.vapidKey;
  const FIREBASE_AUTH_DOMAIN = configuration?.authDomain;

  const { SERVER_URL } = getEnv(ENV);

  return (
    <ConfigurationContext.Provider
      value={{
        GOOGLE_CLIENT_ID,
        STRIPE_PUBLIC_KEY,
        PAYPAL_KEY,
        GOOGLE_MAPS_KEY,
        AMPLITUDE_API_KEY,
        LIBRARIES,
        COLORS,
        SENTRY_DSN,
        SKIP_EMAIL_VERIFICATION,
        SKIP_MOBILE_VERIFICATION,
        CURRENCY,
        CURRENCY_SYMBOL,
        DELIVERY_RATE,
        COST_TYPE,
        TEST_OTP,
        SERVER_URL,
        FIREBASE_KEY,
        FIREBASE_APP_ID,
        FIREBASE_VAPID_KEY,
        FIREBASE_MEASUREMENT_ID,
        FIREBASE_MSG_SENDER_ID,
        FIREBASE_PROJECT_ID,
        FIREBASE_STORAGE_BUCKET,
        FIREBASE_AUTH_DOMAIN

      }}
    >
      {children}
    </ConfigurationContext.Provider>
  );
};
export const ConfigurationConsumer = ConfigurationContext.Consumer;
export const useConfig = () => useContext(ConfigurationContext);
