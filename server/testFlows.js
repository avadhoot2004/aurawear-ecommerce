// Comprehensive automated test suite for AuraWear MERN Platform
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Helper to extract cookie from response
const getCookie = (res) => {
  const setCookie = res.headers['set-cookie'];
  if (!setCookie) return '';
  return setCookie[0].split(';')[0];
};

async function runTests() {
  console.log('=== STARTING AURAWEAR COMPREHENSIVE TEST SUITE ===\n');
  let passed = 0;
  let failed = 0;

  const test = (name, condition, details = '') => {
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name}: ${details}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const health = await axios.get(`${API_BASE}/health`);
    test('Server Health Check', health.status === 200 && health.data.success === true);

    // 2. Fetch Products
    const productsRes = await axios.get(`${API_BASE}/products?limit=10`);
    test('Product Catalog Listing', productsRes.data.success && productsRes.data.data.products.length > 0);
    const initialProduct = productsRes.data.data.products[0];
    const initialStock = initialProduct.stock;

    // 3. Register a test user
    const uniqueEmail = `shopper_${Date.now()}@example.com`;
    const regRes = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Priya Verma',
      email: uniqueEmail,
      password: 'Shopper@123'
    });
    const shopperCookie = getCookie(regRes);
    test('Customer Registration & HTTP-only Cookie generation', regRes.status === 201 && shopperCookie.includes('token='));

    // 4. Verify /auth/me with cookie
    const meRes = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Cookie: shopperCookie }
    });
    test('Customer /auth/me authentication verification', meRes.data.data.user.email === uniqueEmail);

    // 5. Add to Cart with size & color
    const cartAddRes = await axios.post(
      `${API_BASE}/cart`,
      {
        productId: initialProduct._id,
        size: initialProduct.sizes[0],
        color: initialProduct.colors[0],
        quantity: 2
      },
      { headers: { Cookie: shopperCookie } }
    );
    test(
      'Add Item to Cart (Size & Color validation)',
      cartAddRes.data.success && cartAddRes.data.data.cart.items.length === 1
    );

    // 6. Verify Server-calculated Cart Totals
    const cartGet = await axios.get(`${API_BASE}/cart`, {
      headers: { Cookie: shopperCookie }
    });
    const expectedSubtotal = initialProduct.finalPrice * 2;
    test(
      'Server-side Authoritative Cart Calculations',
      cartGet.data.data.cart.summary.subtotal === expectedSubtotal
    );

    // 7. Place Order
    const orderRes = await axios.post(
      `${API_BASE}/orders`,
      {
        shippingAddress: {
          fullName: 'Priya Verma',
          phone: '+91 9988776655',
          street: '12 Emerald Heights',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560001'
        },
        paymentMethod: 'COD'
      },
      { headers: { Cookie: shopperCookie } }
    );
    test('Order Placement (COD)', orderRes.status === 201 && orderRes.data.success);
    const placedOrder = orderRes.data.data.order;

    // 8. Verify Stock Decrement
    const productAfterOrder = await axios.get(`${API_BASE}/products/${initialProduct._id}`);
    test(
      'Automatic Inventory Stock Decrement',
      productAfterOrder.data.data.product.stock === initialStock - 2,
      `Expected ${initialStock - 2}, got ${productAfterOrder.data.data.product.stock}`
    );

    // 9. Verify Order appears in customer's list
    const myOrders = await axios.get(`${API_BASE}/orders/my-orders`, {
      headers: { Cookie: shopperCookie }
    });
    test(
      'Customer Order History Retrieval',
      myOrders.data.data.orders.some((o) => o._id === placedOrder._id)
    );

    // 10. Security: Customer cannot access Admin Stats (RBAC 403)
    let customerAdminBlocked = false;
    try {
      await axios.get(`${API_BASE}/admin/stats`, {
        headers: { Cookie: shopperCookie }
      });
    } catch (err) {
      if (err.response?.status === 403) {
        customerAdminBlocked = true;
      }
    }
    test('RBAC Security: Normal Customer Blocked from Admin APIs (403 Forbidden)', customerAdminBlocked);

    // 11. Security: Unauthenticated user cannot access Cart (401)
    let unauthBlocked = false;
    try {
      await axios.get(`${API_BASE}/cart`);
    } catch (err) {
      if (err.response?.status === 401) {
        unauthBlocked = true;
      }
    }
    test('Route Security: Unauthenticated User Blocked from Protected APIs (401 Unauthorized)', unauthBlocked);

    // 12. Admin Flow: Login as seeded Admin
    const adminLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@aurawear.com',
      password: 'Admin@12345'
    });
    const adminCookie = getCookie(adminLoginRes);
    test('Admin Login & Role Verification', adminLoginRes.data.data.user.role === 'admin');

    // 13. Admin Dashboard Metrics
    const statsRes = await axios.get(`${API_BASE}/admin/stats`, {
      headers: { Cookie: adminCookie }
    });
    test(
      'Admin Dashboard Metrics Aggregation',
      statsRes.data.success && statsRes.data.data.metrics.totalOrders >= 1
    );

    // 14. Admin Product Creation CRUD
    const newProductRes = await axios.post(
      `${API_BASE}/products`,
      {
        name: 'Automated Test Silk Scarf',
        description: 'Luxurious mulberry silk scarf for integration verification.',
        brand: 'Aura Test',
        category: 'Accessories',
        gender: 'Unisex',
        price: 1500,
        discount: 10,
        sizes: ['M'],
        colors: ['Crimson'],
        images: ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80'],
        stock: 5
      },
      { headers: { Cookie: adminCookie } }
    );
    test('Admin Create Product (POST /products)', newProductRes.status === 201);
    const createdProductId = newProductRes.data.data.product._id;

    // 15. Admin Update Product
    const updateProdRes = await axios.put(
      `${API_BASE}/products/${createdProductId}`,
      { stock: 25 },
      { headers: { Cookie: adminCookie } }
    );
    test('Admin Update Product Stock (PUT /products/:id)', updateProdRes.data.data.product.stock === 25);

    // 16. Admin Delete Product
    const delProdRes = await axios.delete(`${API_BASE}/products/${createdProductId}`, {
      headers: { Cookie: adminCookie }
    });
    test('Admin Delete Product (DELETE /products/:id)', delProdRes.data.success);

    // 17. Admin Update Order Status
    const updateOrderRes = await axios.put(
      `${API_BASE}/admin/orders/${placedOrder._id}/status`,
      { status: 'CONFIRMED' },
      { headers: { Cookie: adminCookie } }
    );
    test(
      'Admin Fulfillment State Update (CONFIRMED)',
      updateOrderRes.data.data.order.orderStatus === 'CONFIRMED'
    );

    // 18. Customer Cancel Order (with stock recovery)
    const cancelRes = await axios.put(
      `${API_BASE}/orders/${placedOrder._id}/cancel`,
      {},
      { headers: { Cookie: shopperCookie } }
    );
    test('Customer Order Cancellation', cancelRes.data.data.order.orderStatus === 'CANCELLED');

    // 19. Verify Stock Restored after Cancellation
    const prodAfterCancel = await axios.get(`${API_BASE}/products/${initialProduct._id}`);
    test(
      'Inventory Stock Restoration upon Order Cancellation',
      prodAfterCancel.data.data.product.stock === initialStock,
      `Expected ${initialStock}, got ${prodAfterCancel.data.data.product.stock}`
    );

    console.log(`\n========================================`);
    console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed === 0) {
      console.log('🎉 ALL INTEGRATION FLOWS & SECURITY CHECKS PASSED PERFECTLY!');
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error during test run:', err.response?.data || err.message);
    process.exit(1);
  }
}

runTests();
