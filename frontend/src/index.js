import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import App from "./App";
import Dashboard from "./Dashboard";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/dashboard" component={Dashboard} />
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
