const { pool } = require("../infrastructure/PgDB/connect"); // Adjust path if necessary

exports.saveOrder = async ({ razorpay_order_id, amount, currency, status }) => {
  const query = `
    INSERT INTO payments 
      (id, user_id, razorpay_order_id, amount, currency, status, created_at)
    VALUES 
      (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
    RETURNING *;
  `;
  
  const values = [
    '40431f3a-163c-4ccb-8367-ddd4b0b57e5a', // user_id (static for now)
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
