exports.handler = async function(event) {

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {

    if (!process.env.PI_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API key missing' })
      };
    }

    const body = JSON.parse(event.body || '{}');

    const paymentId = body.paymentId;
    const expectedAmount = body.expectedAmount;

    if (!paymentId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing paymentId' })
      };
    }

    /* VERIFY PAYMENT FIRST */
    const verifyResponse = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Key ${process.env.PI_API_KEY}`
        }
      }
    );

    const payment = await verifyResponse.json();

    /* CHECK PAYMENT EXISTS */
    if (!payment || payment.error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid payment' })
      };
    }

    /* PREVENT DOUBLE APPROVAL */
    if (payment.status?.developer_approved === true) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Already approved' })
      };
    }

    /* VERIFY AMOUNT */
    if (
      expectedAmount &&
      Number(payment.amount) !== Number(expectedAmount)
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Amount mismatch'
        })
      };
    }

    /* APPROVE PAYMENT */
    const approveResponse = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/approve`,
      {
        method: 'POST',
        headers: {
          Authorization: `Key ${process.env.PI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const approveData = await approveResponse.json();

    return {
      statusCode: 200,
      body: JSON.stringify(approveData)
    };

  } catch (err) {

    console.error(err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Approval failed'
      })
    };
  }
};
