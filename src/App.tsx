import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Catalog from "./pages/Catalog";
import SellerView from "./pages/SellerView";
import Admin from "./pages/Admin";

function RequireCatalogAuth({ children }: { children: React.ReactElement }) {
  const authed = typeof window !== "undefined" && localStorage.getItem("catalog_auth") === "true";
  if (!authed) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Catalog />} />
        <Route
          path="/vendedor"
          element={
            <RequireCatalogAuth>
              <SellerView />
            </RequireCatalogAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireCatalogAuth>
              <Admin />
            </RequireCatalogAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
