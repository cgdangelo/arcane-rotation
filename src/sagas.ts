import { Reducer } from "redux";
import { delay, fork, put, select, take } from "redux-saga/effects";

const MANA_MAX = 100000;
const BASE_MANA_REGEN = 2000;

export enum Attribute {
  CRITICAL_HIT = "crit",
  HASTE = "haste",
  INTELLECT = "int",
  MASTERY = "mast",
  VERSATILITY = "vers"
}

export enum Resource {
  ARCANE_CHARGES = "arcane_charge",
  MANA = "mana"
}

interface State {
  abilityTimeline: [number, string][];
  attributes: Record<Attribute, number>;
  buffs: {
    [buffName: string]: {
      applied: number;
      expires: number;
      stacks: number;
    };
  };
  casting: {
    abilityName: string;
    castTime: number;
  } | null;
  gcdLocked: boolean;
  resources: {
    [R in Resource]: {
      current: number;
      max: number;
      min: number;
    };
  };
}

export const getCrit = (state: State) =>
  state.attributes[Attribute.CRITICAL_HIT];
export const getHaste = (state: State) => state.attributes[Attribute.HASTE];
export const getInt = (state: State) => state.attributes[Attribute.INTELLECT];
export const getMastery = (state: State) => state.attributes[Attribute.MASTERY];
export const getVers = (state: State) =>
  state.attributes[Attribute.VERSATILITY];
const getArcaneCharges = (state: State) =>
  state.resources[Resource.ARCANE_CHARGES];
const getMana = (state: State) => state.resources[Resource.MANA];
const hasArcanePower = (state: State) => state.buffs["Arcane Power"];
export const getCasting = (state: State) => state.casting;

export const castAttempt = (abilityName: string) => ({
  type: "CAST_ATTEMPT" as const,
  payload: {
    timestamp: Date.now(),
    abilityName
  }
});

const triggerGcd = (gcdLength = 1500) => ({
  type: "TRIGGER_GCD" as const,
  payload: gcdLength
});

const updateGcdLock = (lock = true) => ({
  type: "GCD" as const,
  payload: lock
});

const spellCastStart = (abilityName: string, castTime: number = 0) => ({
  type: "SPELL_CAST_START" as const,
  payload: {
    timestamp: Date.now(),
    abilityName,
    castTime
  }
});

const spellCastFailed = (abilityName: string) => ({
  type: "SPELL_CAST_FAILED" as const,
  payload: {
    timestamp: Date.now(),
    abilityName
  }
});

const spellCastSuccess = (abilityName: string) => ({
  type: "SPELL_CAST_SUCCESS" as const,
  payload: {
    timestamp: Date.now(),
    abilityName
  }
});

const setResourceValue = (resource: Resource, value: number) => ({
  type: "SET_RESOURCE_VALUE" as const,
  payload: {
    timestamp: Date.now(),
    resource,
    value
  }
});

export const setAttributeValue = (attribute: Attribute, value: number) => ({
  type: "SET_ATTRIBUTE_VALUE" as const,
  payload: {
    timestamp: Date.now(),
    attribute,
    value
  }
});

const triggerDamage = (abilityName: string, value: number) => ({
  type: "SPELL_DAMAGE" as const,
  payload: {
    timestamp: Date.now(),
    abilityName,
    value
  }
});

const defaultState: State = {
  abilityTimeline: [],
  attributes: {
    [Attribute.CRITICAL_HIT]: 0.2,
    [Attribute.HASTE]: 0.2,
    [Attribute.INTELLECT]: 10000,
    [Attribute.MASTERY]: 0.2,
    [Attribute.VERSATILITY]: 0.2
  },
  buffs: {},
  casting: null,
  gcdLocked: false,
  resources: {
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
  }
};

type Action = ReturnType<
  | typeof setAttributeValue
  | typeof setResourceValue
  | typeof spellCastFailed
  | typeof spellCastStart
  | typeof spellCastSuccess
  | typeof triggerDamage
  | typeof updateGcdLock
>;

export const rootReducer: Reducer<State, Action> = (
  state = defaultState,
  action
) => {
  switch (action.type) {
    case "GCD":
      return { ...state, gcdLocked: action.payload };

    case "SPELL_CAST_START":
      return { ...state, casting: action.payload };

    case "SPELL_CAST_SUCCESS":
      return {
        ...state,
        abilityTimeline: [
          [action.payload.timestamp, action.payload.abilityName],
          ...state.abilityTimeline
        ],
        casting: null
      };

    case "SET_RESOURCE_VALUE":
      if (!(action.payload.resource in state.resources)) {
        return state;
      }

      return {
        ...state,
        resources: {
          ...state.resources,
          [action.payload.resource]: {
            ...state.resources[action.payload.resource],
            current: action.payload.value
          }
        }
      };

    case "SET_ATTRIBUTE_VALUE":
      if (!(action.payload.attribute in state.attributes)) {
        return state;
      }

      return {
        ...state,
        attributes: {
          ...state.attributes,
          [action.payload.attribute]: action.payload.value
        }
      };

    default:
      return state;
  }
};

export function* manaRegen() {
  while (true) {
    yield delay(1000);

    const mana = yield select(getMana);
    const mastery = yield select(getMastery);

    if (mana.current < mana.max) {
      yield put(
        setResourceValue(
          Resource.MANA,
          Math.min(mana.current + BASE_MANA_REGEN * (1 + mastery), mana.max)
        )
      );
    }
  }
}

export function* globalCooldown() {
  while (true) {
    const { payload } = yield take("TRIGGER_GCD");

    // Set the GCD lock.
    yield put(updateGcdLock());

    // Get character haste.
    const haste = yield select(getHaste);

    // Calculate hasted GCD length (0.75s minimum).
    const gcdLength = Math.min(0.75, payload / (1 + haste));

    // Wait for GCD to expire.
    yield delay(gcdLength);

    // Unlock the GCD.
    yield put(updateGcdLock(false));
  }
}

export function* castWatcher() {
  while (true) {
    const {
      payload: { abilityName }
    } = yield take("CAST_ATTEMPT");

    switch (abilityName) {
      case "Arcane Blast":
        yield fork(arcaneBlast);
        break;

      case "Arcane Barrage":
        yield fork(arcaneBarrage);
        break;
    }
  }
}

export function* arcaneBlast() {
  const casting = yield select(getCasting);

  if (casting !== null) {
    return yield put(spellCastFailed("Arcane Blast"));
  }

  yield put(triggerGcd());

  const { current: currentArcaneCharges, max: maxArcaneCharges } = yield select(
    getArcaneCharges
  );
  const haste = yield select(getHaste);

  const castTime =
    2250 * (1 / (1 + haste)) * (1.0 - 0.08 * currentArcaneCharges);

  yield put(spellCastStart("Arcane Blast", castTime));

  yield delay(castTime);

  const arcanePower = yield select(hasArcanePower);

  const { current: currentMana } = yield select(getMana);
  const cost =
    0.0275 * MANA_MAX * (1 + currentArcaneCharges) * (arcanePower ? 0.8 : 1);

  if (currentMana < cost) {
    yield put(spellCastFailed("Arcane Blast"));

    return false;
  }

  yield put(spellCastSuccess("Arcane Blast"));

  yield put(setResourceValue(Resource.MANA, Math.max(currentMana - cost, 0)));

  const int = yield select(getInt);
  const crit = yield select(getCrit);
  const mast = yield select(getMastery);
  const vers = yield select(getVers);

  yield put(
    triggerDamage(
      "Arcane Blast",
      0.55 *
        int *
        (Math.random() < crit ? 2 : 1) *
        (1 + vers) *
        (1 + (0.6 + mast / 2) * currentArcaneCharges) *
        (arcanePower ? 1.3 : 1)
    )
  );

  if (currentArcaneCharges < maxArcaneCharges) {
    yield put(
      setResourceValue(Resource.ARCANE_CHARGES, currentArcaneCharges + 1)
    );
  }

  return true;
}

export function* arcaneBarrage() {
  const casting = yield select(getCasting);

  if (casting !== null) {
    return yield put(spellCastFailed("Arcane Barrage"));
  }

  yield put(triggerGcd());

  yield put(setResourceValue(Resource.ARCANE_CHARGES, 0));
}
