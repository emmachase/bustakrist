import { useTranslation } from "react-i18next";

export function PlayerList() {
  const [t] = useTranslation();

  return (<div>
    {t("bet.test")}
  </div>);
}
