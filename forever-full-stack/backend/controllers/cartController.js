import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";

// add products to user cart
const addToCart = async (req, res) => {
  try {
    const { userId, productId, size, color, quantity } = req.body;

    // First, find the product to check stock
    const product = await productModel.findById(productId);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    // Find the specific stock item
    const stockItem = product.stockItems.find(
      (item) => item.size === size && item.color === color
    );

    if (!stockItem) {
      return res.json({
        success: false,
        message: "This size and color combination is not available",
      });
    }

    if (stockItem.stock < quantity) {
      return res.json({
        success: false,
        message: "Not enough stock available",
      });
    }

    // Find or create cart for user
    let cart = await userModel.findOne({ userId });
    if (!cart) {
      cart = new userModel({ userId, cartData: [] });
    }

    // Add or update item in cart
    const cartItemIndex = cart.cartData.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (cartItemIndex > -1) {
      cart.cartData[cartItemIndex].quantity += quantity;
    } else {
      cart.cartData.push({ productId, size, color, quantity });
    }

    await cart.save();

    res.json({ success: true, message: "Item added to cart" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// update user cart
const updateCart = async (req, res) => {
  try {
    const { userId, itemId, size, color, quantity } = req.body;

    const userData = await userModel.findById(userId);
    let cartData = await userData.cartData;

    cartData[itemId][size][color] = quantity;

    await userModel.findByIdAndUpdate(userId, { cartData });
    res.json({ success: true, message: "Cart Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// get user cart data
const getUserCart = async (req, res) => {
  try {
    const { userId } = req.body;

    const userData = await userModel.findById(userId);
    let cartData = await userData.cartData;

    res.json({ success: true, cartData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { addToCart, updateCart, getUserCart };
