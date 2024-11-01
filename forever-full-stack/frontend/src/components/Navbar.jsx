import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { BiSearch, BiShoppingBag, BiUser, BiMenu } from "react-icons/bi";

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

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Search Icon */}
        <button
          onClick={() => {
            setShowSearch(true);
            navigate("/collection");
          }}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
        >
          <BiSearch className="w-5 h-5" />
        </button>

        {/* Cart Icon */}
        <Link
          to="/cart"
          className="relative group p-1.5 hover:bg-gray-100 rounded-full transition-colors"
        >
          <div className="relative">
            <BiShoppingBag className="w-5 h-5" />
            {getCartCount() > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 text-center leading-4 bg-black text-white text-[10px] rounded-full">
                {getCartCount()}
              </span>
            )}
          </div>
        </Link>

        {/* Profile Icon */}
        <div className="group relative">
          {token ? (
            <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200">
                <img
                  src={profileImage || assets.profile_icon}
                  className="w-full h-full object-cover"
                  alt="Profile"
                />
              </div>
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <BiUser className="w-5 h-5" />
            </button>
          )}

          {/* Profile Dropdown Menu */}
          {token && (
            <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-2 z-50">
              <div className="flex flex-col gap-2 w-36 py-3 px-5 bg-white text-gray-500 rounded-lg shadow-lg border border-gray-100">
                <NavLink
                  to="/profile"
                  className="cursor-pointer hover:text-black transition-colors"
                >
                  My Profile
                </NavLink>
                <NavLink
                  to="/myshop"
                  className="cursor-pointer hover:text-black transition-colors"
                >
                  ร้านค้าของฉัน
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

        {/* Sell Product Button */}
        {token && (
          <NavLink
            to="/add"
            className="hidden sm:block px-3 py-1.5 bg-black text-white rounded-full text-sm hover:bg-gray-800 transition-colors"
          >
            ลงขายสินค้า
          </NavLink>
        )}

        {/* Mobile Menu Icon */}
        <button
          onClick={() => setVisible(true)}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors sm:hidden ml-1"
        >
          <BiMenu className="w-5 h-5" />
        </button>
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
