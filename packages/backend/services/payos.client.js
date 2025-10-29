// packages/backend/services/payos.client.js
import PayOS from '@payos/node';

const hasCreds = Boolean(
  process.env.PAYOS_CLIENT_ID &&
  process.env.PAYOS_API_KEY &&
  process.env.PAYOS_CHECKSUM_KEY
);

export const payosEnabled = hasCreds && String(process.env.PAYOS_ENABLED ?? '1') !== '0';

if (!payosEnabled) {
  console.warn('[payOS] Disabled or missing credentials. Payments will run in mock mode.');
}

const payos = payosEnabled
  ? new PayOS(
      process.env.PAYOS_CLIENT_ID,
      process.env.PAYOS_API_KEY,
      process.env.PAYOS_CHECKSUM_KEY
    )
  : null;

export default payos;
