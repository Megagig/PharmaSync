import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate as validateRequest } from '../middleware/validation.middleware';
import { RoleType } from '../interfaces/role.interface';

// Import controllers
import {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
} from '../controllers/account.controller';

import {
  getJournalEntries,
  getJournalEntryById,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  postJournalEntry,
  reverseJournalEntry,
} from '../controllers/journalEntry.controller';

import {
  getGeneralLedgerEntries,
  getAccountStatement,
  getTrialBalance,
} from '../controllers/generalLedger.controller';

import {
  getFinancialPeriods,
  getFinancialPeriodById,
  createFinancialPeriod,
  updateFinancialPeriod,
  closeFinancialPeriod,
  lockFinancialPeriod,
  deleteFinancialPeriod,
} from '../controllers/financialPeriod.controller';

import {
  getTaxConfigurations,
  getTaxConfigurationById,
  createTaxConfiguration,
  updateTaxConfiguration,
  deleteTaxConfiguration,
} from '../controllers/taxConfiguration.controller';

// Import validation schemas
import {
  accountSchema,
  accountUpdateSchema,
  journalEntrySchema,
  journalEntryUpdateSchema,
  financialPeriodSchema,
  financialPeriodUpdateSchema,
  taxConfigurationSchema,
  taxConfigurationUpdateSchema,
} from '../validations/accounting.validation';

const router = Router();

// Protect all routes
router.use(protect);

// Chart of Accounts routes
router
  .route('/accounts')
  .get(getAccounts)
  .post(
    restrictTo([RoleType.ADMIN, RoleType.INVENTORY_MANAGER]),
    validateRequest(accountSchema),
    createAccount
  );

router
  .route('/accounts/:id')
  .get(getAccountById)
  .patch(
    restrictTo([RoleType.ADMIN, RoleType.INVENTORY_MANAGER]),
    validateRequest(accountUpdateSchema),
    updateAccount
  )
  .delete(restrictTo([RoleType.ADMIN]), deleteAccount);

// Journal Entry routes
router
  .route('/journal-entries')
  .get(getJournalEntries)
  .post(
    restrictTo([RoleType.ADMIN, RoleType.INVENTORY_MANAGER, RoleType.CASHIER]),
    validateRequest(journalEntrySchema),
    createJournalEntry
  );

router
  .route('/journal-entries/:id')
  .get(getJournalEntryById)
  .patch(
    restrictTo([RoleType.ADMIN, RoleType.INVENTORY_MANAGER, RoleType.CASHIER]),
    validateRequest(journalEntryUpdateSchema),
    updateJournalEntry
  )
  .delete(
    restrictTo([RoleType.ADMIN, RoleType.INVENTORY_MANAGER]),
    deleteJournalEntry
  );

router
  .route('/journal-entries/:id/post')
  .patch(
    restrictTo([RoleType.ADMIN, RoleType.INVENTORY_MANAGER, RoleType.CASHIER]),
    postJournalEntry
  );

router
  .route('/journal-entries/:id/reverse')
  .patch(
    restrictTo([RoleType.ADMIN, RoleType.INVENTORY_MANAGER]),
    reverseJournalEntry
  );

// General Ledger routes
router.route('/general-ledger').get(getGeneralLedgerEntries);

router.route('/general-ledger/account/:id').get(getAccountStatement);

router.route('/general-ledger/trial-balance').get(getTrialBalance);

// Financial Period routes
router
  .route('/financial-periods')
  .get(getFinancialPeriods)
  .post(
    restrictTo([RoleType.ADMIN, RoleType.INVENTORY_MANAGER]),
    validateRequest(financialPeriodSchema),
    createFinancialPeriod
  );

router
  .route('/financial-periods/:id')
  .get(getFinancialPeriodById)
  .patch(
    restrictTo([RoleType.ADMIN, RoleType.INVENTORY_MANAGER]),
    validateRequest(financialPeriodUpdateSchema),
    updateFinancialPeriod
  )
  .delete(restrictTo([RoleType.ADMIN]), deleteFinancialPeriod);

router
  .route('/financial-periods/:id/close')
  .patch(
    restrictTo([RoleType.ADMIN, RoleType.INVENTORY_MANAGER]),
    closeFinancialPeriod
  );

router
  .route('/financial-periods/:id/lock')
  .patch(restrictTo([RoleType.ADMIN]), lockFinancialPeriod);

// Tax Configuration routes
router
  .route('/taxes')
  .get(getTaxConfigurations)
  .post(
    restrictTo([RoleType.ADMIN, RoleType.INVENTORY_MANAGER]),
    validateRequest(taxConfigurationSchema),
    createTaxConfiguration
  );

router
  .route('/taxes/:id')
  .get(getTaxConfigurationById)
  .patch(
    restrictTo([RoleType.ADMIN, RoleType.INVENTORY_MANAGER]),
    validateRequest(taxConfigurationUpdateSchema),
    updateTaxConfiguration
  )
  .delete(restrictTo([RoleType.ADMIN]), deleteTaxConfiguration);

export default router;
