import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Attribute,
  getCrit,
  getHaste,
  getMastery,
  getVers,
  setAttributeValue
} from "./sagas";
import "./Settings.css";

export const Settings: React.FC = () => {
  const dispatch = useDispatch();

  const crit = useSelector(getCrit);
  const haste = useSelector(getHaste);
  const mast = useSelector(getMastery);
  const vers = useSelector(getVers);

  return (
    <div className="Settings">
      <h1>Settings</h1>

      <h2>Attributes</h2>
      <div className="Settings__AttributeGroup">
        <label>Critical Hit {(crit * 100).toFixed(2)}%</label>

        <input
          max={100}
          min={0}
          step={0.1}
          type="range"
          onChange={event => {
            dispatch(
              setAttributeValue(
                Attribute.CRITICAL_HIT,
                Number(event.target.value) / 100
              )
            );
          }}
          value={crit * 100}
        />
      </div>

      <div className="Settings__AttributeGroup">
        <label>Haste {(haste * 100).toFixed(2)}%</label>

        <input
          max={100}
          min={0}
          step={0.1}
          type="range"
          onChange={event => {
            dispatch(
              setAttributeValue(
                Attribute.HASTE,
                Number(event.target.value) / 100
              )
            );
          }}
          value={haste * 100}
        />
      </div>

      <div className="Settings__AttributeGroup">
        <label>Mastery {(mast * 100).toFixed(2)}%</label>

        <input
          max={100}
          min={0}
          step={0.1}
          type="range"
          onChange={event => {
            dispatch(
              setAttributeValue(
                Attribute.MASTERY,
                Number(event.target.value) / 100
              )
            );
          }}
          value={mast * 100}
        />
      </div>

      <div className="Settings__AttributeGroup">
        <label>Versatility {(vers * 100).toFixed(2)}%</label>

        <input
          max={100}
          min={0}
          step={0.1}
          type="range"
          onChange={event => {
            dispatch(
              setAttributeValue(
                Attribute.VERSATILITY,
                Number(event.target.value) / 100
              )
            );
          }}
          value={vers * 100}
        />
      </div>
    </div>
  );
};
