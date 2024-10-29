import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import {
  BiBell,
  BiSearch,
  BiShoppingBag,
  BiUser,
  BiMenu,
} from "react-icons/bi";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
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

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return;

      try {
        const response = await fetch(`${backendUrl}/api/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
          const unread = data.filter(
            (notification) => !notification.isRead
          ).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    if (token) {
      fetchNotifications();
    }
  }, [token, backendUrl]);

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

      <div className="flex items-center gap-4 sm:gap-6">
        {/* Search Icon */}
        <button
          onClick={() => {
            setShowSearch(true);
            navigate("/collection");
          }}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <BiSearch className="w-5 h-5" />
        </button>

        {/* Notification Icon */}
        {token && (
          <div className="group relative">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <div className="relative">
                <BiBell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 text-center leading-4 bg-red-500 text-white text-[10px] rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
            </button>

            <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-2 z-50">
              <div className="flex flex-col w-72 max-h-96 overflow-y-auto py-2 bg-white text-gray-500 rounded-lg shadow-lg border border-gray-100">
                <div className="px-4 py-2 border-b border-gray-100 font-medium">
                  การแจ้งเตือน
                </div>
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                        !notification.isRead ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="text-sm">{notification.message}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500">
                    ไม่มีการแจ้งเตือน
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cart Icon */}
        <Link
          to="/cart"
          className="relative group p-2 hover:bg-gray-100 rounded-full transition-colors"
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
              <div className="w-7 h-7 rounded-full overflow-hidden border border-gray-200">
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
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <BiUser className="w-5 h-5" />
            </button>
          )}

          {token && (
            <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-2 z-50">
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

        {/* Mobile Menu Icon */}
        <button
          onClick={() => setVisible(true)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors sm:hidden"
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
