import { FC, useState } from "react";
import { clazz } from "../util/class";
import "./combo.scss";

export type TabFC = {
  label: string
  children: any
};

export const ComboView: FC<{
  children?: React.ReactElement<TabFC>[]
}> & {
  Tab: FC<TabFC>
} = (props) => {
  const tabs: React.ReactElement<TabFC>[] = props.children
      ?.filter(x => x.type === ComboView.Tab) ?? [];

  const [activeTab, setTab] = useState(0);
  if (activeTab >= tabs.length) setTab(tabs.length - 1);

  return (
    <div className="combo-view">
      <div className="tabs">
        { tabs.map((x, idx) =>
          <div
            className={clazz(activeTab === idx && "active")}
            key={x.props.label}
            onClick={() => setTab(idx)}
          >
            {x.props.label}
          </div>) }
      </div>
      <div className="combo-content">
        { tabs[activeTab]?.props.children }
      </div>
    </div>
  );
};

ComboView.Tab = () => null;
