import { useTranslation } from "react-i18next";
import "./players.scss";
import "../components/playersTable";
import { PlayersTable } from "../components/playersTable";
import React from "react";


export function PlayerList() {
  const [t] = useTranslation();

  return (
    <div className="players-container">
      <table>
        <thead>
          <tr>
            <th className="players-user">{t("players.user")}</th>
            <th>{t("players.at")}</th>
            <th>{t("players.bet")}</th>
            <th className="players-profit">{t("players.profit")}</th>
          </tr>
        </thead>
        <PlayersTable/>
      </table>
    </div>
  );
}
