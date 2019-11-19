import { all, fork } from "@redux-saga/core/effects";
import { applyMiddleware, compose, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import { rootReducer } from "./reducers";
import { castWatcher, globalCooldown, manaRegen } from "./sagas";

const sagaMiddleware = createSagaMiddleware();

// @ts-ignore
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(sagaMiddleware))
);

sagaMiddleware.run(function* rootSaga() {
  yield all([fork(manaRegen), fork(castWatcher), fork(globalCooldown)]);
});

export type State = ReturnType<typeof rootReducer>;
