import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { KButton, NumericalInput, TextInput } from "../components/form";
import { getConnection } from "../meta/connection";
import { AuthResponse, BalanceResponse } from "../meta/networkInterfaces";
import { RequestCode } from "../meta/transportCodes";
import { authUser } from "../store/actions/UserActions";
import { Flexor, Spacer } from "./flex";

export function AuthUI() {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const [mode, setMode] = useState<RequestCode | null>(null);
  const [formName, setName] = useState("");
  const [formPass, setPass] = useState("");

  const performAuth = async () => {
    let result: AuthResponse;
    if (mode === RequestCode.LOGIN) {
      result = await getConnection().login(formName, formPass);
    } else {
      result = await getConnection().register(formName, formPass);
    }

    localStorage.setItem("reauth", result.token);
    dispatch(authUser(result.user, result.bal));
  };

  return (
    <Flexor fill direction="column">
      { mode
        ? <>
          <TextInput label={t("auth.username")} value={formName} onChange={setName}/>
          <TextInput label={t("auth.password")} value={formPass} onChange={setPass} password/>
          <Spacer/>
          <KButton shorty onClick={() => performAuth()}>
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
