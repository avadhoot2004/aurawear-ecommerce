import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// @desc    Create new order from user's current bag
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod = 'COD' } = req.body;

    // Validate shipping address
    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a complete shipping address (fullName, phone, street, city, state, pincode).'
      });
    }

    // Retrieve user's cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your bag is empty. Please add items before checking out.'
      });
    }

    const orderItems = [];
    let itemsPrice = 0;

    // Validate every product, check stock, and deduct inventory securely
    for (const item of cart.items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'An item in your bag is no longer available in our catalog.'
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} units remaining.`
        });
      }

      // Decrement inventory stock
      product.stock -= item.quantity;
      await product.save();

      // Create authoritative snapshot of product at purchase time
      const itemSnapshot = {
        product: product._id,
        name: product.name,
        brand: product.brand,
        image: product.images[0],
        size: item.size,
        color: item.color,
        price: product.finalPrice, // Authoritative price from DB
        quantity: item.quantity
      };

      orderItems.push(itemSnapshot);
      itemsPrice += itemSnapshot.price * itemSnapshot.quantity;
    }

    // Authoritative Server-side calculations
    const shippingPrice = itemsPrice >= 1999 ? 0 : 150;
    const taxPrice = Math.round(itemsPrice * 0.05); // 5% GST
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    // Create Order
    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        street: shippingAddress.street.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim()
      },
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      orderStatus: 'PLACED'
    });

    // Clear user's cart after successful order creation
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      data: {
        order
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        orders
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID (owner or admin only)
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    // Access control: only order owner or admin can view
    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot view orders placed by other users.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        order
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (owner only, if PLACED or CONFIRMED)
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    // Verify ownership
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot modify other users orders.'
      });
    }

    // Check cancellation eligibility
    if (!['PLACED', 'CONFIRMED'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in '${order.orderStatus}' status.`
      });
    }

    // Restore inventory stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    order.orderStatus = 'CANCELLED';
    order.cancelledAt = new Date();
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully and inventory restored.',
      data: {
        order
      }
    });
  } catch (error) {
    next(error);
  }
};
