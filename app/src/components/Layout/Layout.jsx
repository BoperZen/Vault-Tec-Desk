import React from "react";
import PropTypes from "prop-types";
import Header from "./Header";
import { Footer } from "./Footer";
import { Outlet } from "react-router-dom";

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-16 pb-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
