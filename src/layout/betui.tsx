import React from "react";
import { useTranslation } from "react-i18next";
import { KButton, NumericalInput } from "../components/form";
import { Flexor, Spacer } from "./flex";

export function BetUI() {
  const [t] = useTranslation();

  return (
    <Flexor fill direction="column">
      <NumericalInput label={t("bet.betAmt")} suffix="KST"/>
      <NumericalInput label={t("bet.betPayout")} suffix="&times;"/>

      <Spacer/>

      <KButton card>{t("bet.betAction")}</KButton>
    </Flexor>
  );
}
