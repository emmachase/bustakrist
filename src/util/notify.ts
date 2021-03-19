function checkNotificationPromise() {
  try {
    Notification.requestPermission().then();
  } catch (e) {
    return false;
  }

  return true;
}

export function askNotificationPermission() {  // Let's check if the browser supports notifications
  return new Promise<boolean>(resolve => {
    const finalCheck = () => {
      resolve(Notification.permission === "granted");
    };

    if (!("Notification" in window)) {
      resolve(false);
    } else {
      if (checkNotificationPromise()) {
        Notification.requestPermission().then(() => finalCheck());
      } else {
        Notification.requestPermission(() => finalCheck());
      }
    }
  });
}

export function canNotify() {
  return Notification.permission === "granted" && !document.hasFocus();
}
