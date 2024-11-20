import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "฿";
  const delivery_fee = 50;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState("");
  const [shopReviews, setShopReviews] = useState([]);
  const navigate = useNavigate();

  const updateUserProfileImage = async (formData) => {
    const response = await axios.put(
      `${backendUrl}/api/user/updateProfileImage`,
      formData,
      {
        headers: { token },
      }
    );
    setUser(response.data.user);
    return response.data.user;
  };

  const updateUserProfile = async (name) => {
    const response = await axios.put(
      `${backendUrl}/api/user/updateUserProfile`,
      { name },
      {
        headers: { token },
      }
    );
    fetchUserProfile(token);
    return response.data.user;
  };

  const fetchUserProfile = async (token) => {
    const response = await axios.get(`${backendUrl}/api/user/me`, {
      headers: { token },
    });
    if (response.data.success) {
      setUser(response.data.user);
    }
  };

  const fetchShopReviews = async () => {
    const response = await axios.get(`${backendUrl}/api/review/`);
    if (response.data.success) {
      setShopReviews(response.data.reviews);
    }
    return response.data.reviews;
  };

  const submitShopReview = async (review) => {
    if (!user) {
      toast.error("Please login to submit a review");
      return;
    }

    const newReview = {
      ...review,
      name: user.name,
      date: new Date().toLocaleString(),
    };

    const response = await axios.post(`${backendUrl}/api/review/`, newReview);
    setShopReviews([...shopReviews, newReview]);
    return response.data.review;
  };

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Select Product Size and Select Product Color ");
      return;
    }

    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }
    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/add",
          { itemId, size },
          { headers: { token } }
        );
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {}
      }
    }
    return totalCount;
  };

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);

    cartData[itemId][size] = quantity;

    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/update",
          { itemId, size, quantity },
          { headers: { token } }
        );
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalAmount += itemInfo.price * cartItems[items][item];
          }
        } catch (error) {}
      }
    }
    return totalAmount;
  };

  const getProductsData = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list", {
        headers: { token },
      });
      if (response.data.success) {
        setProducts(response.data.products.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getOwnerProducts = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/owner", {
        headers: { token },
      });
      if (response.data.success) {
        setProducts(response.data.products.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getUserCart = async (token) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/cart/get",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getProductsData();
  }, []);

  useEffect(() => {
    if (!token && localStorage.getItem("token")) {
      setToken(localStorage.getItem("token"));
      getUserCart(localStorage.getItem("token"));
    }
    if (token) {
      getUserCart(token);
      fetchUserProfile(token);
    }
  }, [token]);

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    user,
    updateUserProfile,
    setUser,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    setCartItems,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    backendUrl,
    setToken,
    token,
    shopReviews,
    fetchShopReviews,
    submitShopReview,
    fetchUserProfile,
    updateUserProfileImage,
    getProductsData,
    getOwnerProducts,
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
