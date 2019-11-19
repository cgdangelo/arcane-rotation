import { combineReducers, Reducer } from "redux";
import { Attribute, Resource } from "../enum";
import {
  setAttributeValue,
  setResourceValue,
  spellCastStart,
  spellCastSuccess,
  updateGcdLock
} from "./actions";

export const abilityTimeline: Reducer<
  [number, string][],
  ReturnType<typeof spellCastSuccess>
> = (state = [], action) => {
  if (action.type === "SPELL_CAST_SUCCESS") {
    return [[action.payload.timestamp, action.payload.abilityName], ...state];
  }

  return state;
};

export const attributes: Reducer<
  { [A in Attribute]: number },
  ReturnType<typeof setAttributeValue>
> = (
  state = {
    [Attribute.CRITICAL_HIT]: 0.2,
    [Attribute.HASTE]: 0.2,
    [Attribute.INTELLECT]: 10000,
    [Attribute.MASTERY]: 0.2,
    [Attribute.VERSATILITY]: 0.2
  },
  action
) => {
  if (action.type === "SET_ATTRIBUTE_VALUE") {
    return {
      ...state,
      [action.payload.attribute]: action.payload.value
    };
  }

  return state;
};

export const buffs: Reducer<{
  [buffName: string]: {
    applied: number;
    expires: number;
    stacks: number;
  };
}> = (state = {}, action) => state;

export const casting: Reducer<
  {
    abilityName: string;
    castTime: number;
  } | null,
  ReturnType<typeof spellCastStart | typeof spellCastSuccess>
> = (state = null, action) => {
  switch (action.type) {
    case "SPELL_CAST_START":
      return {
        abilityName: action.payload.abilityName,
        castTime: action.payload.castTime
      };

    case "SPELL_CAST_SUCCESS":
      return null;

    default:
      return state;
  }
};

export const gcdLocked: Reducer<boolean, ReturnType<typeof updateGcdLock>> = (
  state = false,
  action
) => {
  if (action.type === "GCD") {
    return action.payload;
  }

  return state;
};

export const resources: Reducer<
  {
    [R in Resource]: {
      current: number;
      max: number;
      min: number;
    };
  },
  ReturnType<typeof setResourceValue>
> = (
  state = {
    [Resource.ARCANE_CHARGES]: {
      current: 0,
      max: 4,
      min: 0
    },
    [Resource.MANA]: {
      current: 100000,
      max: 100000,
      min: 0
    }
  },
  action
) => {
  if (
    action.type === "SET_RESOURCE_VALUE" &&
    action.payload.resource in state
  ) {
    return {
      ...state,
      [action.payload.resource]: {
        ...state[action.payload.resource],
        current: action.payload.value
      }
    };
  }

  return state;
};

export const rootReducer = combineReducers({
  abilityTimeline,
  attributes,
  buffs,
  casting,
  gcdLocked,
  resources
});
