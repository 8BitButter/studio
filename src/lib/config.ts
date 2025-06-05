import type { AppConfiguration } from './types';

export const initialAppConfig: AppConfiguration = {
  documentTypes: [
    {
      id: 'invoice',
      label: 'Invoice',
      iconName: 'Receipt',
      primaryGoals: [
        {
          id: 'extract_all_data',
          label: 'Extract All Key Invoice Data',
          suggestedDetails: [
            { id: 'invoice_number', label: 'Invoice Number' },
            { id: 'vendor_name', label: 'Vendor Name' },
            { id: 'customer_name', label: 'Customer Name' },
            { id: 'invoice_date', label: 'Invoice Date' },
            { id: 'due_date', label: 'Due Date' },
            { id: 'item_description', label: 'Item Description(s)' },
            { id: 'quantity', label: 'Quantity/Quantities' },
            { id: 'unit_price', label: 'Unit Price(s)' },
            { id: 'line_item_total', label: 'Line Item Total(s)' },
            { id: 'subtotal', label: 'Subtotal' },
            { id: 'tax_amount', label: 'Tax Amount' },
            { id: 'total_amount_invoice', label: 'Total Amount (Invoice)' },
          ],
        },
        {
          id: 'extract_line_items',
          label: 'Extract Line Items Only',
          suggestedDetails: [
            { id: 'item_description', label: 'Item Description' },
            { id: 'quantity', label: 'Quantity' },
            { id: 'unit_price', label: 'Unit Price' },
            { id: 'line_item_total', label: 'Line Item Total' },
          ],
        },
        {
          id: 'get_summary',
          label: 'Get Invoice Summary',
          suggestedDetails: [
            { id: 'vendor_name_summary', label: 'Vendor Name' },
            { id: 'invoice_date_summary', label: 'Invoice Date' },
            { id: 'total_amount_summary', label: 'Total Amount' },
            { id: 'payment_status', label: 'Payment Status (if available)' },
          ],
        },
      ],
    },
    {
      id: 'bank_statement',
      label: 'Bank Statement',
      iconName: 'Landmark', // Using Landmark as Banknote is not in lucide-react standard set
      primaryGoals: [
        {
          id: 'list_transactions',
          label: 'List All Transactions',
          suggestedDetails: [
            { id: 'transaction_date', label: 'Transaction Date' },
            { id: 'description', label: 'Description' },
            { id: 'debit_amount', label: 'Debit Amount' },
            { id: 'credit_amount', label: 'Credit Amount' },
            { id: 'running_balance', label: 'Running Balance' },
          ],
        },
        {
          id: 'summarize_period',
          label: 'Summarize Statement Period',
          suggestedDetails: [
            { id: 'account_number', label: 'Account Number' },
            { id: 'statement_period', label: 'Statement Period' },
            { id: 'opening_balance', label: 'Opening Balance' },
            { id: 'closing_balance', label: 'Closing Balance' },
            { id: 'total_debits', label: 'Total Debits for Period' },
            { id: 'total_credits', label: 'Total Credits for Period' },
          ],
        },
      ],
    },
     {
      id: 'receipt',
      label: 'Receipt',
      iconName: 'ShoppingCart', 
      primaryGoals: [
        {
          id: 'extract_purchase_details',
          label: 'Extract Purchase Details',
          suggestedDetails: [
            { id: 'store_name', label: 'Store Name' },
            { id: 'transaction_date_receipt', label: 'Transaction Date & Time' },
            { id: 'item_purchased', label: 'Item(s) Purchased & Price(s)' },
            { id: 'subtotal_receipt', label: 'Subtotal' },
            { id: 'tax_receipt', label: 'Tax Amount' },
            { id: 'total_receipt_amount', label: 'Total Amount' },
            { id: 'payment_method', label: 'Payment Method' },
            { id: 'last_4_digits_card', label: 'Last 4 Digits of Card (if applicable)' },
          ],
        },
      ],
    },
    {
      id: 'general_text',
      label: 'General Text Document',
      iconName: 'FileText',
      primaryGoals: [
        {
          id: 'summarize_text',
          label: 'Summarize Text',
          suggestedDetails: [
            {id: 'key_points_summary', label: 'Key Points (concise)'},
            {id: 'main_ideas_summary', label: 'Main Ideas (bullet points)'},
            {id: 'overall_sentiment', label: 'Overall Sentiment (if applicable)'}
          ],
        },
        {
          id: 'extract_entities',
          label: 'Extract Named Entities',
          suggestedDetails: [
            {id: 'people_names', label: 'People Names'},
            {id: 'locations_places', label: 'Locations/Places'},
            {id: 'organizations_companies', label: 'Organizations/Companies'},
            {id: 'dates_times', label: 'Dates/Times Mentioned'},
            {id: 'monetary_values', label: 'Monetary Values'},
          ],
        },
      ],
    },
    {
      id: 'other',
      label: 'Other (Custom)',
      iconName: 'FilePlus2',
      primaryGoals: [
        {
          id: 'custom_task',
          label: 'Define Custom Task',
          suggestedDetails: [], // User will define these
        },
      ],
    },
  ],
  outputFormats: [
    { id: 'list', label: 'Structured List', iconName: 'ListOrdered' },
    { id: 'csv', label: 'CSV-like (Comma Separated)', iconName: 'FileSpreadsheet' },
    { id: 'bullets', label: 'Bulleted Points', iconName: 'List' },
    { id: 'paragraph', label: 'Paragraph Summary', iconName: 'AlignLeft' },
    { id: 'json', label: 'JSON (JavaScript Object Notation)', iconName: 'Braces' },
  ],
};
