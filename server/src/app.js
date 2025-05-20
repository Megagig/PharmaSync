import express from 'express';
const app = express();

import paymentMethodRoutes from './routes/paymentMethod.routes';
app.use('/api/payment-methods', paymentMethodRoutes);

// ...rest of your app setup (middleware, other routes, etc.)

export default app; 