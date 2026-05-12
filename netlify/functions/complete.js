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
    const txid = body.txid;
    const expectedAmount = body.expectedAmount;

    if (!paymentId || !txid) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing paymentId or txid'
        })
      };
    }

    /* GET PAYMENT DETAILS */
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

    if (!payment || payment.error) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Invalid payment'
        })
      };
    }

    /* VERIFY APPROVED */
    if (payment.status?.developer_approved !== true) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Payment not approved'
        })
      };
    }

    /* VERIFY BLOCKCHAIN */
    if (payment.status?.transaction_verified !== true) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Transaction not verified'
        })
      };
    }

    /* PREVENT DOUBLE COMPLETE */
    if (payment.status?.developer_completed === true) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Already completed'
        })
      };
    }

    /* VERIFY TXID */
    if (payment.transaction?.txid !== txid) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'TXID mismatch'
        })
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

    /* COMPLETE PAYMENT */
    const completeResponse = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/complete`,
      {
        method: 'POST',
        headers: {
          Authorization: `Key ${process.env.PI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ txid })
      }
    );

    const completeData = await completeResponse.json();

    return {
      statusCode: 200,
      body: JSON.stringify(completeData)
    };

  } catch (err) {

    console.error(err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Completion failed'
      })
    };
  }
};
