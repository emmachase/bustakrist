import { useTranslation, Trans } from "react-i18next";
import { Modal, ModalElement } from "../../components/modal";
import "./CreditsModal.scss";

function CreditItem(props: {
  label: string, value: string
}) {
  return (
    <div className="item">
      <div className="label">
        <span>{props.label}</span>
      </div>
      <div className="dot"></div>
      <div className="value">{props.value}</div>
    </div>
  );
}

export const CreditsModal: (props: {}) => ModalElement = (props) => {
  const [t] = useTranslation();

  return (
    <Modal className="credits-modal">
      <Modal.Content>
        <div className="title">
          <img src="/krist.webp"/>
          <div>
            <h1>
              {t("name")}
            </h1>
            <h2 className="t-center sub-h1">
              <Trans i18nKey="credits.title">
                <span>made by</span> <strong>Emma</strong>
              </Trans>
            </h2>
          </div>
        </div>
        <div className="item-credits">
          <CreditItem label={t("credits.progDesign")} value="Emma" />
          <CreditItem label={t("credits.soundDesign")} value="Lemmmy &amp; Emma" />
          <CreditItem label={t("credits.music")} value="Hurt Record" />
          <CreditItem label={t("credits.contributions")} value="3d6" />
          <div style={{ fontSize: 8 }}>{t("credits.cute")}</div>
        </div>
      </Modal.Content>
    </Modal>
  );
};
