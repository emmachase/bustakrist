import React, { FC, Suspense, useContext, useRef, useState } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { clazz } from "../util/class";
import "./modal.scss";
import { Spinner } from "./aesthetic/spinner";
import { Spacer } from "../layout/flex";

export const ModalContext = React.createContext<{
  show(modal: React.ReactElement<typeof Modal>): void
  close(): void
} | null>(null);

export type ModalElement = React.ReactElement<typeof Modal>;

export const ModalProvider: FC<{}> = (props) => {
  const [activeModal, setActiveModal] = useState<ModalElement>();
  const [transition, setTransition] = useState(false);

  const context = useRef({
    show(modal: React.ReactElement<typeof Modal>) {
      if (activeModal === undefined) {
        setTimeout(() => setTransition(true), 0);
      }

      setActiveModal(modal);
    },

    close() {
      setTimeout(() => setActiveModal(undefined), 250);
      setTransition(false);
    },
  });

  return (
    <>
      <ModalContext.Provider value={context.current}>
        {props.children}
        <div className={clazz("scroller", "modal-provider", transition && "active")}>
          {activeModal}
        </div>
      </ModalContext.Provider>
    </>
  );
};

export const Modal: FC<{
  className?: string
  undismissable?: boolean
}> & {
  Header: typeof Header
  Content: typeof Content
} = (props) => {
  const ctx = useContext(ModalContext);

  return (
    <div className="modal-background" onMouseDown={e => {
      if (!props.undismissable) {
        console.log(e);
        ctx?.close();
      }
    }}>
      <div className={clazz("modal", props.className)}
        onMouseDown={e => e.stopPropagation()}
      >
        {props.children}
      </div>
    </div>
  );
};

const Header: FC<{
  close?: boolean
  rightContent?: React.ReactElement
}> = (props) => {
  const ctx = useContext(ModalContext);

  return (
    <div className="modal-header">
      <h1>{props.children}</h1>
      <Spacer/>
      {props.rightContent}
      {props.close && <CloseOutlined onClick={() => ctx?.close()}/>}
    </div>
  );
};
Modal.Header = Header;

const Content: FC<{}> = (props) => {
  const ctx = useContext(ModalContext);

  return (
    <div className="modal-content">
      <Suspense fallback={<Spinner relative/>}>
        {props.children}
      </Suspense>
    </div>
  );
};
Modal.Content = Content;

