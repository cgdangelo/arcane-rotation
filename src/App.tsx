import React from "react";
import { Provider } from "react-redux";
import { AbilityTimeline } from "./AbilityTimeline";
import { ActionBar } from "./ActionBar";
import "./App.css";
import { ArcaneCharges } from "./ArcaneCharges";
import { CastBar } from "./CastBar";
import { ManaBar } from "./ManaBar";
import { Settings } from "./Settings";
import { store } from "./store";

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <div className="App">
        <Settings />

        <AbilityTimeline />

        <ArcaneCharges />
        <ManaBar />
        <CastBar />
        <ActionBar />
      </div>
    </Provider>
  );
};

export default App;
