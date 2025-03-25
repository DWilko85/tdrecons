
import { DataSource } from "@/types/dataSources";

// Sample data sources for demo
export const sampleSources: DataSource[] = [
  {
    id: '1',
    name: 'Sales Data (CRM)',
    type: 'csv',
    keyField: 'orderId',
    fields: ['orderId', 'customer', 'product', 'amount', 'date', 'status'],
    data: [
      { orderId: 'ORD-001', customer: 'Acme Corp', product: 'Premium Plan', amount: 1299.99, date: '2023-06-15', status: 'Completed' },
      { orderId: 'ORD-002', customer: 'Globex Inc', product: 'Basic Plan', amount: 499.99, date: '2023-06-16', status: 'Pending' },
      { orderId: 'ORD-003', customer: 'Wayne Enterprises', product: 'Enterprise Plan', amount: 4999.99, date: '2023-06-18', status: 'Completed' },
      { orderId: 'ORD-004', customer: 'Stark Industries', product: 'Premium Plan', amount: 1299.99, date: '2023-06-20', status: 'Completed' },
      { orderId: 'ORD-005', customer: 'Daily Planet', product: 'Basic Plan', amount: 499.99, date: '2023-06-21', status: 'Failed' },
    ]
  },
  {
    id: '2',
    name: 'Financial Records (ERP)',
    type: 'json',
    keyField: 'reference',
    fields: ['reference', 'client', 'item', 'value', 'transaction_date', 'payment_status'],
    data: [
      { reference: 'ORD-001', client: 'Acme Corporation', item: 'Premium Subscription', value: 1299.99, transaction_date: '2023-06-15', payment_status: 'Paid' },
      { reference: 'ORD-002', client: 'Globex Inc', item: 'Basic Subscription', value: 499.99, transaction_date: '2023-06-16', payment_status: 'Unpaid' },
      { reference: 'ORD-003', client: 'Wayne Enterprises', item: 'Enterprise Subscription', value: 4999.99, transaction_date: '2023-06-18', payment_status: 'Paid' },
      { reference: 'ORD-006', client: 'LexCorp', item: 'Custom Solution', value: 9999.99, transaction_date: '2023-06-22', payment_status: 'Paid' },
      { reference: 'ORD-007', client: 'Oscorp', item: 'Basic Subscription', value: 499.99, transaction_date: '2023-06-24', payment_status: 'Unpaid' },
    ]
  },
  {
    id: '3',
    name: 'Inventory Records',
    type: 'api',
    keyField: 'sku',
    fields: ['sku', 'name', 'category', 'price', 'stock', 'lastUpdated'],
    data: [
      { sku: 'PROD-001', name: 'Smartphone X', category: 'Electronics', price: 999.99, stock: 45, lastUpdated: '2023-06-10' },
      { sku: 'PROD-002', name: 'Laptop Pro', category: 'Electronics', price: 1499.99, stock: 32, lastUpdated: '2023-06-12' },
      { sku: 'PROD-003', name: 'Wireless Earbuds', category: 'Electronics', price: 199.99, stock: 78, lastUpdated: '2023-06-14' },
      { sku: 'PROD-004', name: 'Smart Watch', category: 'Electronics', price: 299.99, stock: 56, lastUpdated: '2023-06-16' },
      { sku: 'PROD-005', name: 'Tablet Mini', category: 'Electronics', price: 399.99, stock: 23, lastUpdated: '2023-06-18' },
    ]
  },
];
