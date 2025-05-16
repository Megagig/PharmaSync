import { store } from '@/store/store';
import { createJournalEntry } from '@/store/slices/accountingSlice';
import { JournalEntryFormData, JournalEntryType } from '@/types/accounting.types';

/**
 * Creates a journal entry for a sale transaction
 * @param saleData The sale transaction data
 * @param accountsMap Map of account types to account IDs
 */
export const createSaleJournalEntry = async (
  saleData: any,
  accountsMap: {
    salesRevenueAccount: string;
    accountsReceivableAccount: string;
    cashAccount: string;
    inventoryAccount: string;
    costOfGoodsSoldAccount: string;
    taxPayableAccount: string;
  }
) => {
  try {
    const {
      _id,
      totalAmount,
      taxAmount,
      subtotal,
      paymentMethod,
      paymentStatus,
      items,
      costOfGoods,
    } = saleData;

    const entryItems = [];
    const date = new Date().toISOString().split('T')[0];
    const isPaid = paymentStatus === 'paid';

    // Credit Sales Revenue
    entryItems.push({
      account: accountsMap.salesRevenueAccount,
      description: 'Sales Revenue',
      debit: 0,
      credit: subtotal,
    });

    // Credit Tax Payable (if tax exists)
    if (taxAmount > 0) {
      entryItems.push({
        account: accountsMap.taxPayableAccount,
        description: 'Sales Tax',
        debit: 0,
        credit: taxAmount,
      });
    }

    // Debit Cash or Accounts Receivable
    if (isPaid) {
      entryItems.push({
        account: accountsMap.cashAccount,
        description: 'Cash from Sale',
        debit: totalAmount,
        credit: 0,
      });
    } else {
      entryItems.push({
        account: accountsMap.accountsReceivableAccount,
        description: 'Accounts Receivable',
        debit: totalAmount,
        credit: 0,
      });
    }

    // If we have cost of goods information, create COGS entry
    if (costOfGoods > 0) {
      // Debit Cost of Goods Sold
      entryItems.push({
        account: accountsMap.costOfGoodsSoldAccount,
        description: 'Cost of Goods Sold',
        debit: costOfGoods,
        credit: 0,
      });

      // Credit Inventory
      entryItems.push({
        account: accountsMap.inventoryAccount,
        description: 'Inventory Reduction',
        debit: 0,
        credit: costOfGoods,
      });
    }

    const journalEntryData: JournalEntryFormData = {
      date,
      description: `Sale #${_id}`,
      reference: _id,
      type: JournalEntryType.SYSTEM,
      items: entryItems,
      relatedEntity: {
        entityType: 'sale',
        entityId: _id,
      },
    };

    await store.dispatch(createJournalEntry(journalEntryData) as any);
    return true;
  } catch (error) {
    console.error('Error creating sale journal entry:', error);
    return false;
  }
};

/**
 * Creates a journal entry for a purchase transaction
 * @param purchaseData The purchase transaction data
 * @param accountsMap Map of account types to account IDs
 */
export const createPurchaseJournalEntry = async (
  purchaseData: any,
  accountsMap: {
    inventoryAccount: string;
    accountsPayableAccount: string;
    cashAccount: string;
  }
) => {
  try {
    const {
      _id,
      totalAmount,
      paymentMethod,
      paymentStatus,
      items,
    } = purchaseData;

    const entryItems = [];
    const date = new Date().toISOString().split('T')[0];
    const isPaid = paymentStatus === 'paid';

    // Debit Inventory
    entryItems.push({
      account: accountsMap.inventoryAccount,
      description: 'Inventory Purchase',
      debit: totalAmount,
      credit: 0,
    });

    // Credit Cash or Accounts Payable
    if (isPaid) {
      entryItems.push({
        account: accountsMap.cashAccount,
        description: 'Cash Payment for Purchase',
        debit: 0,
        credit: totalAmount,
      });
    } else {
      entryItems.push({
        account: accountsMap.accountsPayableAccount,
        description: 'Accounts Payable',
        debit: 0,
        credit: totalAmount,
      });
    }

    const journalEntryData: JournalEntryFormData = {
      date,
      description: `Purchase #${_id}`,
      reference: _id,
      type: JournalEntryType.SYSTEM,
      items: entryItems,
      relatedEntity: {
        entityType: 'purchase',
        entityId: _id,
      },
    };

    await store.dispatch(createJournalEntry(journalEntryData) as any);
    return true;
  } catch (error) {
    console.error('Error creating purchase journal entry:', error);
    return false;
  }
};

/**
 * Creates a journal entry for an expense transaction
 * @param expenseData The expense transaction data
 * @param accountsMap Map of account types to account IDs
 */
export const createExpenseJournalEntry = async (
  expenseData: any,
  accountsMap: {
    expenseAccount: string;
    cashAccount: string;
  }
) => {
  try {
    const {
      _id,
      amount,
      category,
      paymentMethod,
      description,
    } = expenseData;

    const entryItems = [];
    const date = new Date().toISOString().split('T')[0];

    // Debit Expense
    entryItems.push({
      account: accountsMap.expenseAccount,
      description: category || 'Expense',
      debit: amount,
      credit: 0,
    });

    // Credit Cash
    entryItems.push({
      account: accountsMap.cashAccount,
      description: 'Cash Payment for Expense',
      debit: 0,
      credit: amount,
    });

    const journalEntryData: JournalEntryFormData = {
      date,
      description: description || `Expense #${_id}`,
      reference: _id,
      type: JournalEntryType.SYSTEM,
      items: entryItems,
      relatedEntity: {
        entityType: 'expense',
        entityId: _id,
      },
    };

    await store.dispatch(createJournalEntry(journalEntryData) as any);
    return true;
  } catch (error) {
    console.error('Error creating expense journal entry:', error);
    return false;
  }
};

/**
 * Creates a journal entry for a payment transaction
 * @param paymentData The payment transaction data
 * @param accountsMap Map of account types to account IDs
 */
export const createPaymentJournalEntry = async (
  paymentData: any,
  accountsMap: {
    accountsReceivableAccount: string;
    cashAccount: string;
  }
) => {
  try {
    const {
      _id,
      amount,
      paymentMethod,
      relatedInvoice,
    } = paymentData;

    const entryItems = [];
    const date = new Date().toISOString().split('T')[0];

    // Debit Cash
    entryItems.push({
      account: accountsMap.cashAccount,
      description: 'Cash Receipt',
      debit: amount,
      credit: 0,
    });

    // Credit Accounts Receivable
    entryItems.push({
      account: accountsMap.accountsReceivableAccount,
      description: 'Payment on Account',
      debit: 0,
      credit: amount,
    });

    const journalEntryData: JournalEntryFormData = {
      date,
      description: `Payment #${_id}${relatedInvoice ? ` for Invoice #${relatedInvoice}` : ''}`,
      reference: _id,
      type: JournalEntryType.SYSTEM,
      items: entryItems,
      relatedEntity: {
        entityType: 'payment',
        entityId: _id,
      },
    };

    await store.dispatch(createJournalEntry(journalEntryData) as any);
    return true;
  } catch (error) {
    console.error('Error creating payment journal entry:', error);
    return false;
  }
};

/**
 * Creates a journal entry for an inventory adjustment
 * @param adjustmentData The inventory adjustment data
 * @param accountsMap Map of account types to account IDs
 */
export const createInventoryAdjustmentJournalEntry = async (
  adjustmentData: any,
  accountsMap: {
    inventoryAccount: string;
    inventoryAdjustmentAccount: string;
  }
) => {
  try {
    const {
      _id,
      adjustmentType,
      totalValue,
      reason,
    } = adjustmentData;

    const entryItems = [];
    const date = new Date().toISOString().split('T')[0];
    const isIncrease = adjustmentType === 'increase';

    if (isIncrease) {
      // Debit Inventory
      entryItems.push({
        account: accountsMap.inventoryAccount,
        description: 'Inventory Increase',
        debit: totalValue,
        credit: 0,
      });

      // Credit Inventory Adjustment
      entryItems.push({
        account: accountsMap.inventoryAdjustmentAccount,
        description: 'Inventory Adjustment',
        debit: 0,
        credit: totalValue,
      });
    } else {
      // Debit Inventory Adjustment
      entryItems.push({
        account: accountsMap.inventoryAdjustmentAccount,
        description: 'Inventory Adjustment',
        debit: totalValue,
        credit: 0,
      });

      // Credit Inventory
      entryItems.push({
        account: accountsMap.inventoryAccount,
        description: 'Inventory Decrease',
        debit: 0,
        credit: totalValue,
      });
    }

    const journalEntryData: JournalEntryFormData = {
      date,
      description: `Inventory Adjustment #${_id}: ${reason || adjustmentType}`,
      reference: _id,
      type: JournalEntryType.SYSTEM,
      items: entryItems,
      relatedEntity: {
        entityType: 'other',
        entityId: _id,
      },
    };

    await store.dispatch(createJournalEntry(journalEntryData) as any);
    return true;
  } catch (error) {
    console.error('Error creating inventory adjustment journal entry:', error);
    return false;
  }
};
