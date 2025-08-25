const { pool } = require("../infrastructure/PgDB/connect"); // Adjust path if necessary

exports.saveOrder = async ({ user_id, plan_id, razorpay_order_id, amount, currency, status }) => {
  const query = `
    INSERT INTO payments 
      (id, user_id, plan_id, razorpay_order_id, amount, currency, status, created_at)
    VALUES 
      (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())
    RETURNING *;
  `;
  
  const values = [
    user_id,
    plan_id,
    razorpay_order_id,
    amount,
    currency,
    status
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};


exports.savePaymentSuccess = async (paymentData) => {
  const query = `
    UPDATE payments 
    SET razorpay_payment_id = $1, razorpay_signature = $2, status = 'success'
    WHERE razorpay_order_id = $3`;
  const values = [paymentData.razorpay_payment_id, paymentData.razorpay_signature, paymentData.razorpay_order_id];
  await pool.query(query, values);
};

exports.getPaymentByOrderId = async (razorpayOrderId) => {
  const query = 'SELECT * FROM payments WHERE razorpay_order_id = $1;';
  const { rows } = await pool.query(query, [razorpayOrderId]);
  return rows[0] || null;
};
