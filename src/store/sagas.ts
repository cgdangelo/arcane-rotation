import { delay, fork, put, select, take } from "redux-saga/effects";
import { Resource } from "../enum";
import {
  setResourceValue,
  spellCastFailed,
  spellCastStart,
  spellCastSuccess,
  triggerDamage,
  triggerGcd,
  updateGcdLock
} from "./actions";
import {
  getArcaneCharges,
  getCasting,
  getCrit,
  getHaste,
  getInt,
  getMana,
  getMastery,
  getVers,
  hasArcanePower
} from "./selectors";

const MANA_MAX = 100000;
const BASE_MANA_REGEN = 2000;

export function* manaRegen() {
  while (true) {
    yield delay(10);

    const mana = yield select(getMana);
    const mastery = yield select(getMastery);

    if (mana.current < mana.max) {
      yield put(
        setResourceValue(
          Resource.MANA,
          Math.min(
            mana.current + (BASE_MANA_REGEN * (1 + 0.2 * mastery)) / 100,
            mana.max
          )
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
