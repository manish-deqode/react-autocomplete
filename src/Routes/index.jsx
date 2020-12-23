import React from "react";
import { Route, BrowserRouter as Router, Redirect } from "react-router-dom";
import Dashboard from "../Pages/Dashboard";

const Routes = () => (
  <Router basename={process.env.PUBLIC_URL || ''}>
    <Route path="/" component={Dashboard} />
    <Redirect from="*" to="/" />
  </Router>
);

export default Routes;
