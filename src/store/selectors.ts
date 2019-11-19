import { State } from ".";
import { Attribute, Resource } from "../enum";

export const getCrit = (state: State) =>
  state.attributes[Attribute.CRITICAL_HIT];

export const getHaste = (state: State) => state.attributes[Attribute.HASTE];

export const getInt = (state: State) => state.attributes[Attribute.INTELLECT];

export const getMastery = (state: State) => state.attributes[Attribute.MASTERY];

export const getVers = (state: State) =>
  state.attributes[Attribute.VERSATILITY];

export const getArcaneCharges = (state: State) =>
  state.resources[Resource.ARCANE_CHARGES];
export const getMana = (state: State) => state.resources[Resource.MANA];

export const hasArcanePower = (state: State) => state.buffs["Arcane Power"];

export const getCasting = (state: State) => state.casting;
