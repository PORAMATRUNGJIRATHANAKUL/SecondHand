import { createContext, useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "฿";
  const delivery_fee = 50;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState("");
  const [shopReviews, setShopReviews] = useState([]);
  const navigate = useNavigate();

  const createReportProblem = async (formData) => {
    const response = await axios.post(
      `${backendUrl}/api/reportproblem`,
      formData,
      { headers: { token } }
    );
    return response.data.report;
  };

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

  const updateUserProfile = async (
    name,
    displayName,
    bankName,
    bankAccount,
    bankAccountName
  ) => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/user/updateUserProfile`,
        {
          name,
          displayName,
          bankName,
          bankAccount,
          bankAccountName,
        },
        {
          headers: { token },
        }
      );

      if (response.data.success) {
        await fetchUserProfile(token);
      }
      return response.data;
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("ไม่สามารถอัพเดทโปรไฟล์ได้");
      return { success: false };
    }
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
      toast.error("กรุณาเข้าสู่ระบบก่อนรีวิว");
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

  const addToCart = async ({ productId, size, color, quantity }) => {
    if (!size || !color) {
      toast.error("กรุณาเลือกไซส์และสี");
      return;
    }

    const cartData = [...cartItems];

    if (cartData.find((item) => item.productId === productId)) {
      const itemIndex = cartData.findIndex(
        (item) =>
          item.productId === productId &&
          item.size === size &&
          item.color === color
      );
      if (itemIndex !== -1) {
        cartData[itemIndex].quantity += quantity;
      } else {
        cartData.push({ productId, size, color, quantity });
      }
    } else {
      cartData.push({ productId, size, color, quantity });
    }

    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/add",
          { productId, size, color, quantity },
          { headers: { token } }
        );
      } catch (error) {
        console.log(error);
        toast.error("เกิดข้อผิดพลาด: " + error.message);
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

  const updateQuantity = async (index, quantity) => {
    let cartData = structuredClone(cartItems);

    cartData[index].quantity = quantity;

    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/update",
          {
            productId: cartData[index].productId,
            size: cartData[index].size,
            quantity,
          },
          { headers: { token } }
        );
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  const deleteItemFromCart = async (index) => {
    const cartData = structuredClone(cartItems);
    cartData.splice(index, 1);
    setCartItems(cartData);
  };

  const getCartAmount = useCallback(() => {
    let totalAmount = 0;
    if (cartItems.length === 0) {
      return 0;
    }

    for (let i = 0; i < cartItems.length; i++) {
      let itemInfo = products.find(
        (product) => product._id === cartItems[i].productId
      );
      for (const size in cartItems[i]) {
        if (cartItems[i][size] > 0) {
          totalAmount += itemInfo.price * cartItems[i][size];
        }
      }
    }
    return totalAmount;
  }, [cartItems, products]);

  const getProductsData = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list", {
        headers: { token },
      });
      if (response.data.success) {
        setProducts(response.data.products.reverse());
      } else {
        toast.error(response.data.message || "ไม่สามารถโหลดข้อมูลสินค้าได้");
      }
    } catch (error) {
      console.log(error);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า");
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
        toast.error(response.data.message || "ไม่สามารถโหลดข้อมูลสินค้าได้");
      }
    } catch (error) {
      console.log(error);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า");
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
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลตะกร้าสินค้า");
    }
  };

  useEffect(() => {
    getProductsData();
  }, []);

  useEffect(() => {
    if (!token && localStorage.getItem("token")) {
      setToken(localStorage.getItem("token"));
      // getUserCart(localStorage.getItem("token"));
    }
    if (token) {
      // getUserCart(token);
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
    createReportProblem,
    deleteItemFromCart,
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
