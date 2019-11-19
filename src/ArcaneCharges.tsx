import React from "react";
import { useSelector } from "react-redux";
import "./ArcaneCharges.css";
import { Resource } from "./enum";
import { State } from "./store";

export const ArcaneCharges: React.FC = () => {
  const arcaneCharges = useSelector(
    (state: State) => state.resources[Resource.ARCANE_CHARGES]
  );

  const arcaneChargeBars = [];

  for (
    let arcaneChargeIndex = 1;
    arcaneChargeIndex <= arcaneCharges.max;
    arcaneChargeIndex++
  ) {
    arcaneChargeBars.push(
      <div
        key={arcaneChargeIndex}
        className={`ArcaneCharges__Charge${
          arcaneChargeIndex <= arcaneCharges.current
            ? " ArcaneCharges__Charge--Charged"
            : ""
        }`}
      />
    );
  }

  return <div className="ArcaneCharges">{arcaneChargeBars}</div>;
};
