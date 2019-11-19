import React from "react";
import { useSelector } from "react-redux";
import "./AbilityTimeline.css";
import { State } from "./store";

export const AbilityTimeline: React.FC = () => {
  const abilityTimeline = useSelector((state: State) => state.abilityTimeline);

  return (
    <dl className="AbilityTimeline">
      {abilityTimeline.map(([timestamp, abilityName]) => (
        <React.Fragment key={timestamp}>
          <dt>{timestamp}</dt>
          <dd>{abilityName}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
};
