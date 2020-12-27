import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import "firebase/auth";
import "firebase/firestore";
import "firebase/analytics";
import { FirebaseAppProvider } from "reactfire";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

import fbConfig from "./config/firebase.json";
import Loading from "./components/Loading";

ReactDOM.render(
  <React.StrictMode>
    <Suspense fallback={<Loading />}>
      <FirebaseAppProvider firebaseConfig={fbConfig}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </FirebaseAppProvider>
    </Suspense>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
