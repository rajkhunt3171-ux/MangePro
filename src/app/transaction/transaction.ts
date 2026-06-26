import { Component, OnInit, computed, signal } from '@angular/core';
import { TransactionService } from './transaction-service';

type TransactionRecord = {
  transactionId?: string | number | null;
  patientId?: string | number | null;
  visitId?: string | number | null;
  drId?: string | number | null;
  adminUserId?: string | number | null;
  charge?: number | string | null;
  paymentType?: string | null;
  paymentStatus?: string | null;
  doctorCommission?: number | string | null;
  commissionAmount?: number | string | null;
  balance?: number | string | null;
  time?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  [key: string]: any;
};

@Component({
  selector: 'app-transaction',
  imports: [],
  templateUrl: './transaction.html',
  styleUrl: './transaction.scss',
})
export class Transaction implements OnInit {
  transactions = signal<TransactionRecord[]>([]);
  loading = false;
  errorMessage = '';
  searchText = signal('');

  filteredTransactions = computed(() => {
    const search = this.searchText().trim().toLowerCase();
    const transactions = this.transactions();

    if (!search) {
      return transactions;
    }

    return transactions.filter((transaction) =>
      [
        transaction?.transactionId,
        transaction?.patientId,
        transaction?.visitId,
        transaction?.drId,
        transaction?.adminUserId
      ].some((value) => String(value ?? '').toLowerCase().includes(search))
    );
  });

  constructor(private transactionService: TransactionService) { }

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.loading = true;
    this.errorMessage = '';

    this.transactionService.getTransactionList().subscribe({
      next: (res) => {
        this.transactions.set(res.transactionList || []);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.transactions.set([]);
        this.errorMessage = err?.error?.message;
      },
    });
  }

  setSearchText(value: string) {
    this.searchText.set(value);
  }

  get totalTransactions() {
    return this.transactions().length;
  }

  get totalChargeAmount() {
    return this.transactions().reduce((sum, transaction) => sum + this.getNumericValue(transaction?.charge), 0);
  }

  get totalCommissionAmount() {
    return this.transactions().reduce((sum, transaction) => sum + this.getNumericValue(transaction?.commissionAmount), 0);
  }

  get totalBalanceAmount() {
    return this.transactions().reduce((sum, transaction) => sum + this.getNumericValue(transaction?.balance), 0);
  }

  getDisplayValue(value: any) {
    if (value === undefined || value === null || String(value).trim() === '') {
      return 'N/A';
    }
    return value;
  }

  getAmountLabel(value: any) {
    return `Rs ${this.getNumericValue(value).toLocaleString('en-IN')}`;
  }

  getCommissionLabel(transaction: TransactionRecord) {
    const commission = this.getNumericValue(transaction?.doctorCommission);
    if (!commission) {
      return '0%';
    }
    return `${commission}%`;
  }

  getTransactionTimeDate(transaction: TransactionRecord) {
    const value = transaction?.time || transaction?.createdAt || transaction?.updatedAt;
    const date = value ? new Date(value) : null;

    if (!date || Number.isNaN(date.getTime())) {
      return {
        date: 'N/A',
        time: '',
      };
    }

    return {
      date: date.toLocaleDateString('en-GB'),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  }

  getPaymentTypeLabel(transaction: TransactionRecord) {
    return this.formatLabel(transaction?.paymentType);
  }

  getPaymentStatusLabel(transaction: TransactionRecord) {
    return this.formatLabel(transaction?.paymentStatus);
  }

  getPaymentTypeClass(transaction: TransactionRecord) {
    const type = String(transaction?.paymentType ?? '').trim().toLowerCase();

    if (type === 'cash') {
      return 'cash';
    }

    if (['online', 'upi', 'card', 'net banking'].includes(type)) {
      return 'online';
    }

    return 'unknown';
  }

  getPaymentStatusClass(transaction: TransactionRecord) {
    const status = String(transaction?.paymentStatus ?? '').trim().toLowerCase();

    if (['paid', 'success', 'completed'].includes(status)) {
      return 'paid';
    }

    if (['unpaid', 'pending', 'waiting', 'processing'].includes(status)) {
      return 'pending';
    }

    if (['failed', 'cancelled', 'rejected'].includes(status)) {
      return 'failed';
    }

    return 'unknown';
  }

  private formatLabel(value: any) {
    const label = String(value ?? '').trim();
    if (!label) {
      return 'N/A';
    }
    if (label.toLowerCase() === 'upi') {
      return 'UPI';
    }
    return label
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  private getNumericValue(value: any) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }
}
