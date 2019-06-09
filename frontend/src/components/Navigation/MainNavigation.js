import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import AuthContext from "../../context/auth-context";

import "./MainNavigation.css";

const MainNavigation = props => {
  const authenticationContext = useContext(AuthContext);
  return (
    <header className="main-navigation">
      <div className="main-navigation__logo">
        <h1>Events</h1>
      </div>
      <nav className="main-navigation__items">
        <ul>
          {!authenticationContext.token && (
            <li>
              <NavLink to="/auth">Authenticate</NavLink>
            </li>
          )}
          <li>
            <NavLink to="/events">Events</NavLink>
          </li>
          {authenticationContext.token && (
            <React.Fragment>
              <li>
                <NavLink to="/bookings">Bookings</NavLink>
              </li>
              <li>
                <button onClick={authenticationContext.logout}>Logout</button>
              </li>
            </React.Fragment>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default MainNavigation;
