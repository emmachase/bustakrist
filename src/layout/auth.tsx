import React from "react";
import { useTranslation } from "react-i18next";
import { KButton, NumericalInput } from "../components/form";
import { Flexor, Spacer } from "./flex";

export function AuthUI() {
  const [t] = useTranslation();

  return (
    <Flexor fill direction="column">
      <Spacer/>
      <KButton card>{t("auth.login")}</KButton>
      <Spacer/>
      <KButton card>{t("auth.register")}</KButton>
      <Spacer/>
    </Flexor>
  );
}
