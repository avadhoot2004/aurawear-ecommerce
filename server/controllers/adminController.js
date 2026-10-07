import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// @desc    Get Admin Dashboard metrics and stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res, next) => {
  try {
    const [totalProducts, totalUsers, totalOrders, revenueAgg, recentOrders, lowStockProducts] =
      await Promise.all([
        Product.countDocuments(),
        User.countDocuments({ role: 'user' }),
        Order.countDocuments(),
        Order.aggregate([
          { $match: { orderStatus: { $ne: 'CANCELLED' } } },
          { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
        ]),
        Order.find()
          .sort({ createdAt: -1 })
          .limit(6)
          .populate('user', 'name email'),
        Product.find({ stock: { $lte: 5 } }).select('name brand stock images finalPrice')
      ]);

    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalProducts,
          totalUsers,
          totalOrders,
          totalRevenue,
          lowStockCount: lowStockProducts.length
        },
        recentOrders,
        lowStockProducts
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders with optional status filter & pagination (Admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;

    const query = {};
    if (status && status !== 'ALL') {
      query.orderStatus = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * pageSize;

    const [orders, totalOrders] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate('user', 'name email'),
      Order.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          totalOrders,
          totalPages: Math.ceil(totalOrders / pageSize) || 1,
          currentPage: pageNum,
          limit: pageSize
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Allowed: ${allowedStatuses.join(', ')}`
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    const prevStatus = order.orderStatus;

    // If changing to CANCELLED and wasn't already CANCELLED, restore inventory
    if (status === 'CANCELLED' && prevStatus !== 'CANCELLED') {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
      order.cancelledAt = new Date();
    }

    // If changing to DELIVERED, mark COD as paid
    if (status === 'DELIVERED') {
      order.isPaid = true;
      order.paidAt = new Date();
      order.deliveredAt = new Date();
    }

    order.orderStatus = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}.`,
      data: {
        order
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        users
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (Admin)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either "user" or "admin".'
      });
    }

    // Prevent self role modification
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own admin role.'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}.`,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
