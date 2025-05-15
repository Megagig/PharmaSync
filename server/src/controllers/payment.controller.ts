import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Payment from '../models/payment.model';
import Customer from '../models/customer.model';
import Supplier from '../models/supplier.model';
import Invoice from '../models/invoice.model';
import Sale from '../models/sale.model';
import PurchaseOrder from '../models/purchaseOrder.model';
import CreditTransaction from '../models/creditTransaction.model';
import { PaymentDirection } from '../interfaces/payment.interface';
import { InvoiceStatus } from '../interfaces/invoice.interface';
import { PaymentStatus } from '../interfaces/sale.interface';
import { CreditTransactionType } from '../interfaces/credit.interface';
import { AppError } from '../utils/error';

/**
 * @desc    Get all payments with pagination and filtering
 * @route   GET /api/payments
 * @access  Private
 */
export const getAllPayments = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};

    // Filter by direction
    if (req.query.direction) {
      filter.direction = req.query.direction;
    }

    // Filter by payment method
    if (req.query.paymentMethod) {
      filter.paymentMethod = req.query.paymentMethod;
    }

    // Filter by customer
    if (req.query.customer) {
      filter.customer = req.query.customer;
    }

    // Filter by supplier
    if (req.query.supplier) {
      filter.supplier = req.query.supplier;
    }

    // Filter by invoice
    if (req.query.invoice) {
      filter.invoice = req.query.invoice;
    }

    // Filter by sale
    if (req.query.sale) {
      filter.sale = req.query.sale;
    }

    // Filter by purchase order
    if (req.query.purchaseOrder) {
      filter.purchaseOrder = req.query.purchaseOrder;
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      filter.paymentDate = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string),
      };
    }

    // Search by payment number or reference
    if (req.query.search) {
      filter.$or = [
        { paymentNumber: { $regex: req.query.search, $options: 'i' } },
        { reference: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Get total count
    const total = await Payment.countDocuments(filter);

    // Get payments with pagination
    const payments = await Payment.find(filter)
      .populate('customer', 'firstName lastName customerNumber')
      .populate('supplier', 'name supplierCode')
      .populate('invoice', 'invoiceNumber')
      .populate('sale', 'saleNumber')
      .populate('purchaseOrder', 'orderNumber')
      .populate('createdBy', 'firstName lastName')
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      data: payments,
      meta: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  }
);

/**
 * @desc    Get payment by ID
 * @route   GET /api/payments/:id
 * @access  Private
 */
export const getPaymentById = asyncHandler(
  async (req: Request, res: Response) => {
    const payment = await Payment.findById(req.params.id)
      .populate('customer', 'firstName lastName customerNumber')
      .populate('supplier', 'name supplierCode contactPerson')
      .populate('invoice', 'invoiceNumber invoiceDate total')
      .populate('sale', 'saleNumber saleDate total')
      .populate('purchaseOrder', 'orderNumber orderDate total')
      .populate('createdBy', 'firstName lastName');

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: payment,
    });
  }
);

/**
 * @desc    Create new payment
 * @route   POST /api/payments
 * @access  Private
 */
export const createPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      amount,
      paymentDate,
      paymentMethod,
      reference,
      notes,
      direction,
      customer,
      supplier,
      invoice,
      sale,
      purchaseOrder,
    } = req.body;

    // Verify related entities exist
    if (customer) {
      const customerExists = await Customer.findById(customer);
      if (!customerExists) {
        throw new AppError('Customer not found', 404);
      }
    }

    if (supplier) {
      const supplierExists = await Supplier.findById(supplier);
      if (!supplierExists) {
        throw new AppError('Supplier not found', 404);
      }
    }

    if (invoice) {
      const invoiceExists = await Invoice.findById(invoice);
      if (!invoiceExists) {
        throw new AppError('Invoice not found', 404);
      }
    }

    if (sale) {
      const saleExists = await Sale.findById(sale);
      if (!saleExists) {
        throw new AppError('Sale not found', 404);
      }
    }

    if (purchaseOrder) {
      const purchaseOrderExists = await PurchaseOrder.findById(purchaseOrder);
      if (!purchaseOrderExists) {
        throw new AppError('Purchase order not found', 404);
      }
    }

    // Create payment record
    const payment = await Payment.create({
      amount,
      paymentDate: paymentDate || new Date(),
      paymentMethod,
      reference,
      notes,
      direction,
      customer: customer || undefined,
      supplier: supplier || undefined,
      invoice: invoice || undefined,
      sale: sale || undefined,
      purchaseOrder: purchaseOrder || undefined,
      createdBy: req.user.id, // From auth middleware
    });

    // Update related entities
    if (invoice) {
      const invoiceDoc = await Invoice.findById(invoice);
      if (invoiceDoc) {
        invoiceDoc.amountPaid += amount;
        invoiceDoc.balance = invoiceDoc.total - invoiceDoc.amountPaid;

        // Update status based on payment
        if (invoiceDoc.balance <= 0) {
          invoiceDoc.status = InvoiceStatus.PAID;
        } else if (invoiceDoc.amountPaid > 0) {
          invoiceDoc.status = InvoiceStatus.PARTIAL;
        }

        await invoiceDoc.save();
      }
    }

    if (sale) {
      const saleDoc = await Sale.findById(sale);
      if (saleDoc) {
        // Update payment status based on amount
        if (amount >= saleDoc.total) {
          saleDoc.paymentStatus = PaymentStatus.PAID;
        } else if (amount > 0) {
          saleDoc.paymentStatus = PaymentStatus.PARTIAL;
        }

        await saleDoc.save();

        // If this is a payment for a credit sale, update customer credit balance
        if (
          saleDoc.paymentMethod === 'credit' &&
          direction === PaymentDirection.RECEIVED &&
          customer
        ) {
          const customerDoc = await Customer.findById(customer);
          if (customerDoc) {
            // Update customer balance
            const newBalance = Math.max(0, customerDoc.currentBalance - amount);
            customerDoc.currentBalance = newBalance;
            await customerDoc.save();

            // Create credit transaction
            await CreditTransaction.create({
              customer,
              transactionType: CreditTransactionType.PAYMENT,
              amount,
              balance: newBalance,
              description: `Payment for sale: ${saleDoc.saleNumber}`,
              reference: payment.paymentNumber,
              sale: sale,
              payment: payment._id,
              createdBy: req.user.id,
            });
          }
        }
      }
    }

    if (purchaseOrder) {
      const purchaseOrderDoc = await PurchaseOrder.findById(purchaseOrder);
      if (purchaseOrderDoc) {
        // Update payment status based on amount
        if (amount >= purchaseOrderDoc.total) {
          purchaseOrderDoc.paymentStatus = 'paid';
        } else if (amount > 0) {
          purchaseOrderDoc.paymentStatus = 'partial';
        }

        await purchaseOrderDoc.save();
      }
    }

    res.status(201).json({
      status: 'success',
      data: payment,
    });
  }
);

/**
 * @desc    Update payment
 * @route   PATCH /api/payments/:id
 * @access  Private
 */
export const updatePayment = asyncHandler(
  async (req: Request, res: Response) => {
    const { amount, paymentDate, paymentMethod, reference, notes } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    // Store old amount for updating related entities
    const oldAmount = payment.amount;

    // Update fields
    if (amount !== undefined) payment.amount = amount;
    if (paymentDate) payment.paymentDate = new Date(paymentDate);
    if (paymentMethod) payment.paymentMethod = paymentMethod;
    if (reference) payment.reference = reference;
    if (notes) payment.notes = notes;

    await payment.save();

    // If amount changed, update related entities
    if (amount !== undefined && amount !== oldAmount) {
      const amountDifference = amount - oldAmount;

      // Update invoice if linked
      if (payment.invoice) {
        const invoiceDoc = await Invoice.findById(payment.invoice);
        if (invoiceDoc) {
          invoiceDoc.amountPaid += amountDifference;
          invoiceDoc.balance = invoiceDoc.total - invoiceDoc.amountPaid;

          // Update status based on payment
          if (invoiceDoc.balance <= 0) {
            invoiceDoc.status = InvoiceStatus.PAID;
          } else if (invoiceDoc.amountPaid > 0) {
            invoiceDoc.status = InvoiceStatus.PARTIAL;
          } else {
            invoiceDoc.status = InvoiceStatus.SENT;
          }

          await invoiceDoc.save();
        }
      }

      // Update sale if linked
      if (payment.sale) {
        const saleDoc = await Sale.findById(payment.sale);
        if (saleDoc) {
          // Update payment status based on total payment amount
          const totalPayments = await Payment.aggregate([
            { $match: { sale: saleDoc._id } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ]);

          const totalPaid =
            totalPayments.length > 0 ? totalPayments[0].total : 0;

          if (totalPaid >= saleDoc.total) {
            saleDoc.paymentStatus = PaymentStatus.PAID;
          } else if (totalPaid > 0) {
            saleDoc.paymentStatus = PaymentStatus.PARTIAL;
          } else {
            saleDoc.paymentStatus = PaymentStatus.UNPAID;
          }

          await saleDoc.save();
        }
      }

      // Update purchase order if linked
      if (payment.purchaseOrder) {
        const purchaseOrderDoc = await PurchaseOrder.findById(
          payment.purchaseOrder
        );
        if (purchaseOrderDoc) {
          // Update payment status based on total payment amount
          const totalPayments = await Payment.aggregate([
            { $match: { purchaseOrder: purchaseOrderDoc._id } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ]);

          const totalPaid =
            totalPayments.length > 0 ? totalPayments[0].total : 0;

          if (totalPaid >= purchaseOrderDoc.total) {
            purchaseOrderDoc.paymentStatus = 'paid';
          } else if (totalPaid > 0) {
            purchaseOrderDoc.paymentStatus = 'partial';
          } else {
            purchaseOrderDoc.paymentStatus = 'unpaid';
          }

          await purchaseOrderDoc.save();
        }
      }
    }

    res.status(200).json({
      status: 'success',
      data: payment,
    });
  }
);
