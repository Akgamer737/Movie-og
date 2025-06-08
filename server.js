// server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Shiprocket credentials (DO NOT expose these on frontend)
const SHIPROCKET_EMAIL = "t67599249@gmail.com";
const SHIPROCKET_PASSWORD = "ggq*TsNJB#Cgto#3";

let shiprocketToken = null;

// Authenticate with Shiprocket API
async function authenticateShiprocket() {
  try {
    const response = await axios.post("https://apiv2.shiprocket.in/v1/external/auth/login", {
      email: t67599249@gmail.com,
      password: ggq*TsNJB#Cgto#3,
    });
    shiprocketToken = response.data.token;
    console.log("✅ Shiprocket authenticated");
    return shiprocketToken;
  } catch (err) {
    console.error("❌ Shiprocket auth failed", err.message);
    throw err;
  }
}

// API: Place Order
app.post("/api/place-order", async (req, res) => {
  try {
    if (!shiprocketToken) await authenticateShiprocket();

    const orderId = "AK" + Math.floor(1000 + Math.random() * 9000); // Generate AKxxxx
    const today = new Date().toISOString().split("T")[0];

    const userData = req.body;

    const payload = {
      order_id: orderId,
      order_date: today,
      billing_customer_name: userData.name,
      billing_address: userData.address,
      billing_city: "Kolkata",
      billing_state: "West Bengal",
      billing_country: "India",
      billing_pincode: "700001",
      billing_email: userData.email,
      billing_phone: userData.phone,
      payment_method: userData.payment,
      shipping_is_billing: true,
      order_items: [
        {
          name: "Sample Product",
          sku: "SKU1234",
          units: 1,
          selling_price: 299,
        },
      ],
    };

    const orderResponse = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      payload,
      {
        headers: {
          Authorization: `Bearer ${shiprocketToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      success: true,
      orderId,
      shiprocketOrderId: orderResponse.data.order_id,
      trackingUrl: `https://levelup-bazar.shiprocket.co/tracking/order/${orderId}`,
    });
  } catch (error) {
    console.error("Order Error:", error.response?.data || error.message);
    if (
      error.response?.status === 401 ||
      error.response?.data?.message === "Unauthenticated"
    ) {
      shiprocketToken = null; // Token expired
    }
    res.status(500).json({ success: false, message: "Failed to place order." });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
