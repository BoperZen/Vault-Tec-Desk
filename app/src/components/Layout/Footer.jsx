import React from "react";

export function Footer() {
  return (
    <footer className="fixed bottom-0 w-full h-18 bg-secondary/95 text-white flex items-center justify-center px-4 py-3 shadow-md">
      <div className="w-full max-w-7xl text-center">
        <p className="text-sm font-medium">ISW-613</p>
        <p className="text-xs text-muted">{new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
