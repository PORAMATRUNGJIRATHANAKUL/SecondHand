import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const {
    setShowSearch,
    getCartCount,
    navigate,
    token,
    setToken,
    setCartItems,
    backendUrl,
    user,
    fetchUserProfile,
  } = useContext(ShopContext);

  useEffect(() => {
    if (token) {
      fetchUserProfile(token);
    }
  }, [token]);

  useEffect(() => {
    if (user?.profileImage) {
      setProfileImage(user.profileImage);
    }
  }, [user]);

  const logout = () => {
    navigate("/login");
    localStorage.removeItem("token");
    setToken("");
    setCartItems({});
    setProfileImage("");
  };

  return (
    <div className="flex items-center justify-between py-5 font-medium">
      <Link to="/">
        <img src={assets.logo} className="w-42" alt="Logo" />
      </Link>

      <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 ${isActive ? "text-black" : ""}`
          }
        >
          <p>HOME</p>
          <hr className="w-1/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink
          to="/collection"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 ${isActive ? "text-black" : ""}`
          }
        >
          <p>COLLECTION</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink
          to="/review"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 ${isActive ? "text-black" : ""}`
          }
        >
          <p>REVIEW</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
      </ul>

      <div className="flex items-center gap-6">
        <img
          onClick={() => {
            setShowSearch(true);
            navigate("/collection");
          }}
          src={assets.search_icon}
          className="w-5 cursor-pointer hover:opacity-80 transition-opacity"
          alt="Search"
        />

        <div className="group relative">
          {token ? (
            <div className="w-7 h-7 rounded-full overflow-hidden cursor-pointer border border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md transition-all duration-200">
              <img
                src={profileImage || assets.profile_icon}
                className="w-full h-full object-cover"
                alt="Profile"
              />
            </div>
          ) : (
            <img
              onClick={() => navigate("/login")}
              className="w-5 cursor-pointer hover:opacity-80 transition-opacity"
              src={assets.profile_icon}
              alt="Profile Icon"
            />
          )}

          {token && (
            <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4 z-50">
              <div className="flex flex-col gap-2 w-36 py-3 px-5 bg-white text-gray-500 rounded-lg shadow-lg border border-gray-100">
                <NavLink
                  to="/profile"
                  className="cursor-pointer hover:text-black transition-colors"
                >
                  My Profile
                </NavLink>
                <p
                  onClick={() => navigate("/orders")}
                  className="cursor-pointer hover:text-black transition-colors"
                >
                  Orders
                </p>
                <p
                  onClick={logout}
                  className="cursor-pointer hover:text-black transition-colors"
                >
                  Logout
                </p>
              </div>
            </div>
          )}
        </div>

        <Link to="/cart" className="relative group">
          <img
            src={assets.cart_icon}
            className="w-5 min-w-5 group-hover:opacity-80 transition-opacity"
            alt="Cart"
          />
          <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
            {getCartCount()}
          </p>
        </Link>

        <img
          onClick={() => setVisible(true)}
          src={assets.menu_icon}
          className="w-5 cursor-pointer sm:hidden hover:opacity-80 transition-opacity"
          alt="Menu"
        />
      </div>

      {/* Sidebar menu for small screens */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 overflow-hidden bg-white shadow-xl transition-all duration-300 ${
          visible ? "w-64" : "w-0"
        }`}
      >
        <div className="flex flex-col text-gray-600">
          <div
            onClick={() => setVisible(false)}
            className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <img
              className="h-4 rotate-180"
              src={assets.dropdown_icon}
              alt="Back"
            />
            <p>Back</p>
          </div>
          <NavLink
            onClick={() => setVisible(false)}
            className={({ isActive }) =>
              `py-3 px-6 border-b hover:bg-gray-50 transition-colors ${
                isActive ? "text-black font-semibold" : ""
              }`
            }
            to="/"
          >
            HOME
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className={({ isActive }) =>
              `py-3 px-6 border-b hover:bg-gray-50 transition-colors ${
                isActive ? "text-black font-semibold" : ""
              }`
            }
            to="/collection"
          >
            COLLECTION
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className={({ isActive }) =>
              `py-3 px-6 border-b hover:bg-gray-50 transition-colors ${
                isActive ? "text-black font-semibold" : ""
              }`
            }
            to="/review"
          >
            REVIEW
          </NavLink>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {visible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setVisible(false)}
        />
      )}
    </div>
  );
};

export default Navbar;
