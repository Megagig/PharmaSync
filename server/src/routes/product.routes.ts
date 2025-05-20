import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addInventoryItem,
  updateInventoryItem,
  removeInventoryItem,
  addSalesPriceLevel,
  updateSalesPriceLevel,
  deleteSalesPriceLevel,
  addPurchasePriceLevel,
  updatePurchasePriceLevel,
  deletePurchasePriceLevel,
  getProductHistory,
  getProductBatches,
} from '../controllers/product.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createProductSchema,
  updateProductSchema,
  addProductInventoryItemSchema,
  updateProductInventoryItemSchema,
} from '../validators/product.validator';
import { RoleType } from '../interfaces/role.interface';

const router = Router();

// Protect all routes
router.use(protect);

// Get all products and create product
router
  .route('/')
  .get(getAllProducts)
  .post(
    restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
    validate(createProductSchema),
    createProduct
  );

// Get, update, and delete product by ID
router
  .route('/:id')
  .get(getProductById)
  .patch(
    restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
    validate(updateProductSchema),
    updateProduct
  )
  .delete(restrictTo([RoleType.ADMIN]), deleteProduct);

// Get product history
router.route('/:id/history').get(getProductHistory);

// Get product batches
router.route('/:id/batches').get(getProductBatches);

// Inventory management
router
  .route('/:id/inventory')
  .post(
    restrictTo([
      RoleType.ADMIN,
      RoleType.PHARMACIST,
      RoleType.PHARMACY_TECHNICIAN,
    ]),
    validate(addProductInventoryItemSchema),
    addInventoryItem
  );

router
  .route('/:id/inventory/:itemId')
  .patch(
    restrictTo([
      RoleType.ADMIN,
      RoleType.PHARMACIST,
      RoleType.PHARMACY_TECHNICIAN,
    ]),
    validate(updateProductInventoryItemSchema),
    updateInventoryItem
  )
  .delete(
    restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
    removeInventoryItem
  );

// Sales price level management
router.post('/:id/sales-price-levels', addSalesPriceLevel);
router.patch('/:id/sales-price-levels/:levelId', updateSalesPriceLevel);
router.delete('/:id/sales-price-levels/:levelId', deleteSalesPriceLevel);

// Purchase price level management
router.post('/:id/purchase-price-levels', addPurchasePriceLevel);
router.patch('/:id/purchase-price-levels/:levelId', updatePurchasePriceLevel);
router.delete('/:id/purchase-price-levels/:levelId', deletePurchasePriceLevel);

export default router;
