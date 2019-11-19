import React from "react";
import { useDispatch } from "react-redux";
import "./ActionBar.css";
import { castAttempt } from "./store/actions";

export const ActionBar: React.FC = () => {
  return (
    <div className="ActionBar">
      <ActionBarAbility abilityName="Arcane Blast" />
      <ActionBarAbility abilityName="Arcane Barrage" />
    </div>
  );
};

export const ActionBarAbility: React.FC<{ abilityName: string }> = ({
  abilityName
}) => {
  const dispatch = useDispatch();

  return (
    <i
      className="ActionBarAbility"
      onClick={() => {
        dispatch(castAttempt(abilityName));
      }}
    >
      {abilityName}
    </i>
  );
};
