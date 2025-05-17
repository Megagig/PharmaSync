import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Customer from '../models/customer.model';
import { AppError } from '../utils/error';
import { toObjectId } from '../utils/idConverter';

/**
 * @desc    Get all customers
 * @route   GET /api/customers
 * @access  Private
 */
export const getAllCustomers = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const searchTerm = req.query.search as string;
    const type = req.query.type as string;
    const isActive = req.query.isActive as string;

    // Build query
    const query: any = {};

    if (searchTerm) {
      query.$or = [
        { firstName: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { phone: { $regex: searchTerm, $options: 'i' } },
        { customerNumber: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    if (type) {
      query.type = type;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Execute query
    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCustomers = await Customer.countDocuments(query);
    const totalPages = Math.ceil(totalCustomers / limit);

    res.status(200).json({
      status: 'success',
      data: {
        customers,
        meta: {
          totalCustomers,
          totalPages,
          currentPage: page,
        },
      },
    });
  }
);

/**
 * @desc    Get customer by ID
 * @route   GET /api/customers/:id
 * @access  Private
 */
export const getCustomerById = asyncHandler(
  async (req: Request, res: Response) => {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: customer,
    });
  }
);

/**
 * @desc    Create new customer
 * @route   POST /api/customers
 * @access  Private
 */
export const createCustomer = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      customerNumber,
      type,
      healthcareProfessionalType,
      firstName,
      lastName,
      email,
      phone,
      addresses,
      organization,
      taxId,
      priceLevel,
      creditLimit,
      notes,
      patientId,
    } = req.body;

    // Check if customer with same phone or email already exists
    if (email) {
      const existingCustomer = await Customer.findOne({ email });
      if (existingCustomer) {
        throw new AppError('Customer with this email already exists', 400);
      }
    }

    const existingCustomerByPhone = await Customer.findOne({ phone });
    if (existingCustomerByPhone) {
      throw new AppError('Customer with this phone number already exists', 400);
    }

    // Create customer
    const customer = await Customer.create({
      customerNumber,
      type,
      healthcareProfessionalType,
      firstName,
      lastName,
      email,
      phone,
      addresses,
      organization,
      taxId,
      priceLevel,
      creditLimit,
      currentBalance: 0,
      notes,
      isActive: true,
      patientId,
      createdBy: toObjectId(req.user.id),
    });

    res.status(201).json({
      status: 'success',
      data: customer,
    });
  }
);

/**
 * @desc    Update customer
 * @route   PATCH /api/customers/:id
 * @access  Private
 */
export const updateCustomer = asyncHandler(
  async (req: Request, res: Response) => {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    // Check if email is being changed and if it already exists
    if (req.body.email && req.body.email !== customer.email) {
      const existingCustomer = await Customer.findOne({
        email: req.body.email,
      });
      if (existingCustomer) {
        throw new AppError('Customer with this email already exists', 400);
      }
    }

    // Check if phone is being changed and if it already exists
    if (req.body.phone && req.body.phone !== customer.phone) {
      const existingCustomer = await Customer.findOne({
        phone: req.body.phone,
      });
      if (existingCustomer) {
        throw new AppError(
          'Customer with this phone number already exists',
          400
        );
      }
    }

    // Update customer
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: updatedCustomer,
    });
  }
);

/**
 * @desc    Delete customer (soft delete by setting isActive to false)
 * @route   DELETE /api/customers/:id
 * @access  Private
 */
export const deleteCustomer = asyncHandler(
  async (req: Request, res: Response) => {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    customer.isActive = false;
    await customer.save();

    res.status(200).json({
      status: 'success',
      data: null,
    });
  }
);

/**
 * @desc    Add address to customer
 * @route   POST /api/customers/:id/addresses
 * @access  Private
 */
export const addCustomerAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    const { street, city, state, postalCode, country, isDefault } = req.body;

    // If this address is set as default, update all other addresses
    if (isDefault) {
      customer.addresses.forEach((address) => {
        address.isDefault = false;
      });
    }

    // Add address
    customer.addresses.push({
      street,
      city,
      state,
      postalCode,
      country: country || 'Nigeria',
      isDefault: isDefault || false,
    });

    await customer.save();

    res.status(201).json({
      status: 'success',
      data: customer,
    });
  }
);

/**
 * @desc    Update customer address
 * @route   PATCH /api/customers/:id/addresses/:addressId
 * @access  Private
 */
export const updateCustomerAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    const address = customer.addresses.find(
      (addr) => addr._id?.toString() === req.params.addressId
    );

    if (!address) {
      throw new AppError('Address not found', 404);
    }

    // If this address is being set as default, update all other addresses
    if (req.body.isDefault) {
      customer.addresses.forEach((addr) => {
        if (addr._id && addr._id.toString() !== req.params.addressId) {
          addr.isDefault = false;
        }
      });
    }

    // Update address fields
    const { street, city, state, postalCode, country, isDefault } = req.body;

    if (street !== undefined) {
      address.street = street;
    }

    if (city !== undefined) {
      address.city = city;
    }

    if (state !== undefined) {
      address.state = state;
    }

    if (postalCode !== undefined) {
      address.postalCode = postalCode;
    }

    if (country !== undefined) {
      address.country = country;
    }

    if (isDefault !== undefined && !address.isDefault) {
      address.isDefault = isDefault;
    }

    await customer.save();

    res.status(200).json({
      status: 'success',
      data: customer,
    });
  }
);

/**
 * @desc    Remove customer address
 * @route   DELETE /api/customers/:id/addresses/:addressId
 * @access  Private
 */
export const removeCustomerAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    const address = customer.addresses.find(
      (addr) => addr._id?.toString() === req.params.addressId
    );

    if (!address) {
      throw new AppError('Address not found', 404);
    }

    // Don't allow removing the only address
    if (customer.addresses.length === 1) {
      throw new AppError('Cannot remove the only address', 400);
    }

    // If removing the default address, set another address as default
    if (address.isDefault && customer.addresses.length > 1) {
      const otherAddress = customer.addresses.find(
        (addr) => addr._id && addr._id.toString() !== req.params.addressId
      );
      if (otherAddress) {
        otherAddress.isDefault = true;
      }
    }

    // Remove the address from the array
    customer.addresses = customer.addresses.filter(
      (addr) => addr._id?.toString() !== req.params.addressId
    );
    await customer.save();

    res.status(200).json({
      status: 'success',
      data: null,
    });
  }
);
