import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { askNotificationPermission } from "../util/notify";

export const NotifyPopup = () => {
  const [t] = useTranslation();
  if ("Notification" in window === false) {
    return null;
  }

  const [asked, setAsked] = useState(false);
  useEffect(() => {
    if (Notification.permission === "default") {
      askNotificationPermission().then(() => setAsked(true));
    }
  }, [Notification.permission]);

  if (asked || Notification.permission !== "default") return null;

  return (
    <div className="notify-popup">
      {t("notify.request")}
    </div>
  );
};
