import { Request, Response } from 'express';
import { PaymentMethod } from '../interfaces/payment.interface';

export const getPaymentMethods = (req: Request, res: Response) => {
    const methods = Object.values(PaymentMethod).map((method) => ({
        _id: method,
        name: method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        isActive: true,
        type: 'standard',
    }));
    res.status(200).json({ status: 'success', data: methods });
}; 