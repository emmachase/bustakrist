import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { KButton, KInput } from "../components/form";
import { getConnection, isRequestError } from "../meta/connection";
import { AuthResponse, BalanceResponse } from "../meta/networkInterfaces";
import { ErrorCode, ErrorCode, ErrorDetail, RequestCode } from "../meta/transportCodes";
import { addFriends, authUser } from "../store/actions/UserActions";
import { Flexor, Spacer } from "./flex";

const normalName = (val: string) => /^[0-9a-zA-Z_\-$]+$/.test(val);

export function AuthUI() {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const [mode, setMode] = useState<RequestCode | null>(null);
  const [formName, setName] = useState("");
  const [formPass, setPass] = useState("");

  const [userError, setUserError] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  const checkName = (val: string, hard: boolean): boolean => {
    val = val.trim();
    if (hard && val.length < 3) {
      setUserError(t("errors.formMin", { min: 3 }));
    } else if (val.length > 32) {
      setUserError(t("errors.formMax", { max: 32 }));
    } else if (mode === RequestCode.REGISTER && !normalName(val)) {
      setUserError(t("errors.nameAllowed"));
    } else {
      setUserError(null);
      return false;
    }

    return true;
  };

  const checkPass = (val: string, hard: boolean): boolean => {
    checkName(formName, hard);

    if (hard && val.length < 8) {
      setPassError(t("errors.formMin", { min: 8 }));
    } else if (val.length > 320) {
      setPassError(t("errors.formMax", { max: 320 }));
    } else {
      setPassError(null);
      return false;
    }

    return true;
  };

  const performAuth = async () => {
    if (checkName(formName, true)) return;
    if (checkPass(formPass, true)) return;

    try {
      let result: AuthResponse;
      if (mode === RequestCode.LOGIN) {
        result = await getConnection().login(formName.trim(), formPass.trim());
      } else {
        result = await getConnection().register(formName.trim(), formPass.trim());
      }

      localStorage.setItem("reauth", result.token);
      dispatch(authUser(result.user, result.bal));
      dispatch(addFriends(result.friends));
    } catch (e) {
      if (mode === RequestCode.LOGIN) {
        setUserError(" ");
        setPassError(t("errors.invalidCredentials"));
      } else {
        if (isRequestError(e)) {
          if (e.error === ErrorDetail.USERNAME_TAKEN) setUserError(t("errors.userExists"));
          else if (e.errorType === ErrorCode.BANNED) setUserError(t("errors.userBanned"));
          else {
            setUserError(" ");
            setPassError(t("errors.unknown"));
            console.error(e);
          }
        } else {
          setUserError(" ");
          setPassError(t("errors.unknown"));
          console.error(e);
        }
      }
    }
  };

  return (
    <Flexor fill direction="column">
      { mode
        ? <>
          <KInput label={t("auth.username")} value={formName} error={userError}
            onFinish={performAuth} onBlur={n => checkName(n, true)}
            onChange={n => (setName(n), checkName(n, false))}
          />
          <KInput label={t("auth.password")} value={formPass} error={passError}
            onFinish={performAuth} password onBlur={p => checkPass(p, true)}
            onChange={p => (setPass(p), checkPass(p, false))}
          />
          <Spacer/>
          <KButton shorty onClick={() => performAuth()}
            disabled={
              !! (userError || passError)
              || (formName.trim().length < 3 || formPass.trim().length < 8)
            }
          >
            {mode === RequestCode.LOGIN ? t("auth.login") : t("auth.register")}
          </KButton>
          <div className="t-center">
            <span
              className="inline-action"
              onClick={() => mode === RequestCode.LOGIN
                ? setMode(RequestCode.REGISTER)
                : setMode(RequestCode.LOGIN)}>
              {mode === RequestCode.LOGIN ? t("auth.register") : t("auth.login")}
            </span>
          </div>
        </>
        : <>
          <Spacer/>
          <KButton onClick={() => setMode(RequestCode.LOGIN)} card>{t("auth.login")}</KButton>
          <Spacer/>
          <KButton onClick={() => setMode(RequestCode.REGISTER)} card>{t("auth.register")}</KButton>
          <Spacer/>
        </>
      }
    </Flexor>
  );
}
