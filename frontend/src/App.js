import React, { Component } from "react";
import { BrowserRouter, Route, Redirect, Switch } from "react-router-dom";
import AuthPage from "./pages/Auth";
import EventsPage from "./pages/Events";
import BookingsPage from "./pages/Bookings";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Route path="/" component={null} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/events" component={EventsPage} />
      <Route path="/bookings" component={BookingsPage} />
    </BrowserRouter>
  );
}

export default App;
