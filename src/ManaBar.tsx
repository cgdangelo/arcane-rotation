import React from "react";
import { useSelector } from "react-redux";
import { Resource } from "./enum";
import "./ManaBar.css";
import { State } from "./store";

export const ManaBar: React.FC = () => {
  const mana = useSelector((state: State) => state.resources[Resource.MANA]);

  return (
    <div className="ManaBar">
      <span
        className="ManaBar__Bar"
        style={{ width: `${(mana.current / mana.max) * 100}%` }}
      />
    </div>
  );
};
