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
  addPriceLevel,
  updatePriceLevel,
  removePriceLevel,
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
  addProductPriceLevelSchema,
  updateProductPriceLevelSchema,
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

// Price level management
router
  .route('/:id/price-levels')
  .post(
    restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
    validate(addProductPriceLevelSchema),
    addPriceLevel
  );

router
  .route('/:id/price-levels/:levelId')
  .patch(
    restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]),
    validate(updateProductPriceLevelSchema),
    updatePriceLevel
  )
  .delete(restrictTo([RoleType.ADMIN, RoleType.PHARMACIST]), removePriceLevel);

export default router;
