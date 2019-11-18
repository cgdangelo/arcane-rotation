import React, { useEffect, useRef, useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { applyMiddleware, compose, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import { all, fork } from "redux-saga/effects";
import "./App.css";
import {
  castAttempt,
  castWatcher,
  getCasting,
  globalCooldown,
  manaRegen,
  Resource,
  rootReducer
} from "./sagas";

const sagaMiddleware = createSagaMiddleware();

// @ts-ignore
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(sagaMiddleware))
);

sagaMiddleware.run(function* rootSaga() {
  yield all([fork(manaRegen), fork(castWatcher), fork(globalCooldown)]);
});

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <div className="App">
        <AbilityTimeline />

        <ArcaneCharges />
        <ManaBar />
        <CastBar />
        <ActionBar />
      </div>
    </Provider>
  );
};

const ArcaneCharges: React.FC = () => {
  const arcaneCharges = useSelector(
    (state: ReturnType<typeof rootReducer>) =>
      state.resources[Resource.ARCANE_CHARGES]
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
        className={`ArcaneCharges__charge${
          arcaneChargeIndex <= arcaneCharges.current
            ? " ArcaneCharges__charge--charged"
            : ""
        }`}
      />
    );
  }

  return <div className="ArcaneCharges">{arcaneChargeBars}</div>;
};

const ManaBar: React.FC = () => {
  const mana = useSelector(
    (state: ReturnType<typeof rootReducer>) => state.resources[Resource.MANA]
  );

  return (
    <div className="ManaBar">
      <span
        className="ManaBar__bar"
        style={{ width: `${(mana.current / mana.max) * 100}%` }}
      />
    </div>
  );
};

const ActionBar: React.FC = () => {
  return (
    <div className="ActionBar">
      <ActionBarAbility abilityName="Arcane Blast" />
      <ActionBarAbility abilityName="Arcane Barrage" />
    </div>
  );
};

const ActionBarAbility: React.FC<{ abilityName: string }> = ({
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

const AbilityTimeline: React.FC = () => {
  const abilityTimeline = useSelector(
    (state: ReturnType<typeof rootReducer>) => state.abilityTimeline
  );

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

function useInterval(callback: () => void, delay: number) {
  const savedCallback = useRef<typeof callback>();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }

    if (delay !== null) {
      let id = setInterval(tick, delay);

      return () => clearInterval(id);
    }
  }, [delay]);
}

const CastBar: React.FC = () => {
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
          <span className="CastBar__spellInfo">
            Casting: {casting.abilityName} {(castTimer / 1000).toFixed(2)} /{" "}
            {(casting.castTime / 1000).toFixed(2)}
          </span>

          <span
            className="CastBar__bar"
            style={{ width: `${(castTimer / casting.castTime) * 100}%` }}
          />
        </>
      ) : (
        <>
          <span className="CastBar__spellInfo">Idle</span>
          <span className="CastBar__bar" />
        </>
      )}
    </div>
  );
};

export default App;
