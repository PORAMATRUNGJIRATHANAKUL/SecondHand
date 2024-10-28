import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import SearchBar from "./components/SearchBar";
import { Routes, Route } from "react-router-dom";
import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Orders";
import Review from "./pages/Review";
import Qrcode from "./pages/Qrcode";
import Login from "./components/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = "฿";

const App = () => {
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : ""
  );
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem("token", token);
  }, [token]);

  // แก้ไขฟังก์ชันนี้ โดยลบ qrcode ออกจากเงื่อนไข
  const shouldShowSearchBar = () => {
    return location.pathname !== "/add";
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer />
      {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <Navbar setToken={setToken} />
          <hr />
          <div className="flex w-full">
            <Sidebar />
            <div className="w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base">
              {shouldShowSearchBar() && (
                <SearchBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              )}
              <Routes>
                <Route path="/add" element={<Add token={token} />} />
                <Route
                  path="/list"
                  element={<List token={token} searchQuery={searchQuery} />}
                />
                <Route
                  path="/orders"
                  element={<Orders token={token} searchQuery={searchQuery} />}
                />
                <Route
                  path="/review"
                  element={<Review token={token} searchQuery={searchQuery} />}
                />
                <Route
                  path="/qrcode"
                  element={<Qrcode token={token} searchQuery={searchQuery} />}
                />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
