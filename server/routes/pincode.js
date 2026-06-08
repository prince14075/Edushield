const express = require('express');
const router = express.Router();

router.get('/:pincode', async (req, res) => {
  const { pincode } = req.params;

  if (!/^\d{6}$/.test(pincode)) {
    return res.status(400).json({ success: false, error: "Invalid pincode" });
  }

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);

        if (!response.ok) {
       return res.status(response.status).json({ success: false, error: "Failed to fetch pincode details" });
    }

    const data = await response.json();

    if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
      return res.json({ success: true, data: data[0].PostOffice[0] });
    } else {
      return res.status(404).json({ success: false, error: "No address found for this INC pincode" });
    }
  } catch (error) {
    console.error("Pincode API Error:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch pincode details securely" });
  }
});

module.exports = router;
