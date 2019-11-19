import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "./CastBar.css";
import { getCasting } from "./store/selectors";
import { useInterval } from "./useInterval";

export const CastBar: React.FC = () => {
  const casting = useSelector(getCasting);
  const [castTimer, setCastTimer] = useState(0);

  useEffect(() => {
    if (casting) {
      setCastTimer(0);
    }

    return () => {
      setCastTimer(0);
    };
  }, [casting]);

  useInterval(() => setCastTimer(prevState => prevState + 10), 10);

  return (
    <div className="CastBar">
      {casting ? (
        <>
          <span className="CastBar__SpellInfo">
            Casting: {casting.abilityName} {(castTimer / 1000).toFixed(2)} /{" "}
            {(casting.castTime / 1000).toFixed(2)}
          </span>

          <span
            className="CastBar__Bar"
            style={{ width: `${(castTimer / casting.castTime) * 100}%` }}
          />
        </>
      ) : (
        <>
          <span className="CastBar__SpellInfo">Idle</span>
          <span className="CastBar__Bar" />
        </>
      )}
    </div>
  );
};
