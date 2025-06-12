
import type { AppConfiguration } from './types';

export const initialAppConfig: AppConfiguration = {
  documentTypes: [
    {
      id: 'invoice',
      label: 'Invoice (Generic)',
      iconName: 'Receipt',
      primaryGoals: [
        {
          id: 'extract_invoice_data',
          label: 'Extract Key Invoice Data',
          suggestedDetails: [
            { id: 'invoice_number', label: 'Invoice Number' },
            { id: 'vendor_name', label: 'Vendor Name' },
            { id: 'buyer_name_company_name', label: 'Buyer Name / Company Name' },
            { id: 'invoice_date', label: 'Invoice Date (YYYY-MM-DD)' },
            { id: 'due_date', label: 'Due Date' },
            { id: 'item_descriptions', label: 'Item Description(s)' },
            { id: 'quantity', label: 'Quantity' },
            { id: 'rate', label: 'Rate' },
            { id: 'tax', label: 'Tax' },
            { id: 'total_amount', label: 'Total Amount' },
            { id: 'gstin_vendor_buyer', label: 'GSTIN (Vendor & Buyer)' },
            { id: 'currency', label: 'Currency' },
            { id: 'payment_terms', label: 'Payment Terms' },
            { id: 'po_number_if_applicable', label: 'PO Number (if applicable)' },
          ],
        },
      ],
    },
    {
      id: 'tax_invoice',
      label: 'Tax Invoice (e.g., GST Invoice)',
      iconName: 'BookCopy',
      primaryGoals: [
        {
          id: 'extract_tax_invoice_data',
          label: 'Extract Key Tax Invoice Data',
          suggestedDetails: [
            { id: 'tax_invoice_number', label: 'Invoice Number' },
            { id: 'tax_invoice_date', label: 'Invoice Date (YYYY-MM-DD)' },
            { id: 'seller_name', label: 'Seller/Supplier Name' },
            { id: 'seller_address', label: 'Seller/Supplier Address' },
            { id: 'seller_gstin', label: 'Seller/Supplier GSTIN/VAT ID' },
            { id: 'buyer_name', label: 'Buyer/Recipient Name' },
            { id: 'buyer_address', label: 'Buyer/Recipient Address' },
            { id: 'buyer_gstin', label: 'Buyer/Recipient GSTIN/VAT ID' },
            { id: 'hsn_sac_codes', label: 'HSN/SAC Code(s)' },
            { id: 'item_service_descriptions', label: 'Item/Service Description(s)' },
            { id: 'item_quantity', label: 'Quantity' },
            { id: 'item_unit_price', label: 'Unit Price/Rate' },
            { id: 'item_taxable_value', label: 'Taxable Value (per item/total)' },
            { id: 'cgst_rate_amount', label: 'CGST Rate & Amount' },
            { id: 'sgst_utgst_rate_amount', label: 'SGST/UTGST Rate & Amount' },
            { id: 'igst_rate_amount', label: 'IGST Rate & Amount' },
            { id: 'total_tax_amount', label: 'Total Tax Amount' },
            { id: 'invoice_total_value', label: 'Total Invoice Value (incl. tax)' },
            { id: 'place_of_supply', label: 'Place of Supply' },
            { id: 'reverse_charge', label: 'Reverse Charge (Yes/No)' },
            { id: 'eway_bill_number', label: 'E-way Bill Number (if applicable)' },
            { id: 'tax_payment_terms', label: 'Payment Terms' },
            { id: 'seller_bank_details', label: 'Seller Bank Details for Payment' },
          ],
        },
      ],
    },
    {
      id: 'bank_statement',
      label: 'Bank Statement',
      iconName: 'Landmark',
      primaryGoals: [
        {
          id: 'extract_bank_statement_data',
          label: 'Extract Key Bank Statement Data',
          suggestedDetails: [
            { id: 'account_holder_name', label: 'Account Holder Name' },
            { id: 'bank_name', label: 'Bank Name' },
            { id: 'account_number_masked', label: 'Account Number (masked if sensitive)' },
            { id: 'statement_period_start_end_dates', label: 'Statement Period (Start and End Dates)' },
            { id: 'transaction_date', label: 'Transaction Date' },
            { id: 'description_remarks', label: 'Description / Remarks' },
            { id: 'reference_utr_cheque_number', label: 'Reference / UTR / Cheque Number' },
            { id: 'debit_amount', label: 'Debit Amount' },
            { id: 'credit_amount', label: 'Credit Amount' },
            { id: 'closing_balance', label: 'Closing Balance' },
          ],
        },
      ],
    },
    {
      id: 'receipt_general',
      label: 'Receipt',
      iconName: 'ShoppingCart',
      primaryGoals: [
        {
          id: 'extract_receipt_data',
          label: 'Extract Key Receipt Data',
          suggestedDetails: [
            { id: 'receipt_number', label: 'Receipt Number' },
            { id: 'payer_name', label: 'Payer Name' },
            { id: 'payee_name_company', label: 'Payee Name / Company' },
            { id: 'payment_date', label: 'Payment Date' },
            { id: 'amount_paid', label: 'Amount Paid' },
            { id: 'mode_of_payment', label: 'Mode of Payment (Cash, UPI, Bank Transfer, etc.)' },
            { id: 'reference_number_transaction_id', label: 'Reference Number / Transaction ID' },
            { id: 'tax_amount_breakdown', label: 'Tax Amount / Breakdown (if applicable)' },
          ],
        },
      ],
    },
    {
      id: 'payment_proof_utr',
      label: 'Payment Proofs / UTR Confirmations',
      iconName: 'ShieldCheck',
      primaryGoals: [
        {
          id: 'extract_payment_proof_data',
          label: 'Extract Payment Proof Data',
          suggestedDetails: [
            { id: 'sender_name', label: 'Sender Name' },
            { id: 'receiver_name', label: 'Receiver Name' },
            { id: 'utr_number_transaction_id', label: 'UTR Number / Transaction ID' },
            { id: 'transaction_date_proof', label: 'Transaction Date' },
            { id: 'amount_proof', label: 'Amount' },
            { id: 'bank_names_from_to', label: 'Bank Names (From/To)' },
            { id: 'payment_mode_proof', label: 'Payment Mode' },
            { id: 'remarks_purpose_of_transfer', label: 'Remarks / Purpose of Transfer' },
          ],
        },
      ],
    },
    {
      id: 'tax_statements_certificates',
      label: 'Tax Statements / TDS Certificates',
      iconName: 'FileBadge',
      primaryGoals: [
        {
          id: 'extract_tax_statement_data',
          label: 'Extract Tax Statement Data',
          suggestedDetails: [
            { id: 'pan_number', label: 'PAN Number' },
            { id: 'tan_number', label: 'TAN Number' },
            { id: 'deductor_employer_name', label: 'Deductor/Employer Name' },
            { id: 'assessment_year', label: 'Assessment Year' },
            { id: 'income_head', label: 'Income Head' },
            { id: 'tds_amount', label: 'TDS Amount' },
            { id: 'tax_deposited_date', label: 'Tax Deposited Date' },
            { id: 'challan_number_tax_statement', label: 'Challan Number' },
            { id: 'salary_professional_fee_rent_paid', label: 'Salary / Professional Fee / Rent Paid (as applicable)' },
          ],
        },
      ],
    },
    {
      id: 'salary_slips_payroll',
      label: 'Salary Slips / Payroll Reports',
      iconName: 'ClipboardList',
      primaryGoals: [
        {
          id: 'extract_payroll_data',
          label: 'Extract Payroll Data',
          suggestedDetails: [
            { id: 'employee_name', label: 'Employee Name' },
            { id: 'employee_id_pan', label: 'Employee ID / PAN' },
            { id: 'salary_period', label: 'Salary Period' },
            { id: 'gross_salary', label: 'Gross Salary' },
            { id: 'net_salary', label: 'Net Salary' },
            { id: 'deductions_pf_esi_tds', label: 'Deductions (PF, ESI, TDS)' },
            { id: 'allowances', label: 'Allowances' },
            { id: 'taxable_income', label: 'Taxable Income' },
            { id: 'employer_name_payroll', label: 'Employer Name' },
          ],
        },
      ],
    },
    {
      id: 'purchase_order',
      label: 'Purchase Orders (POs)',
      iconName: 'ShoppingBag',
      primaryGoals: [
        {
          id: 'extract_po_data',
          label: 'Extract Purchase Order Data',
          suggestedDetails: [
            { id: 'po_number', label: 'PO Number' },
            { id: 'issuer_company_name', label: 'Issuer Company Name' },
            { id: 'vendor_name_po', label: 'Vendor Name' },
            { id: 'po_date', label: 'PO Date' },
            { id: 'item_list_quantity_rate', label: 'Item List with Quantity & Rate' },
            { id: 'total_value_po', label: 'Total Value' },
            { id: 'delivery_terms', label: 'Delivery Terms' },
            { id: 'gst_details_po', label: 'GST Details (if applicable)' },
          ],
        },
      ],
    },
    {
      id: 'utility_rent_bills',
      label: 'Bills / Utility Bills / Rent Bills',
      iconName: 'FileDigit',
      primaryGoals: [
        {
          id: 'extract_bill_data',
          label: 'Extract Bill Data',
          suggestedDetails: [
            { id: 'bill_number', label: 'Bill Number' },
            { id: 'vendor_service_provider_name', label: 'Vendor/Service Provider Name' },
            { id: 'billing_date', label: 'Billing Date' },
            { id: 'billing_period', label: 'Billing Period' },
            { id: 'amount_bill', label: 'Amount' },
            { id: 'service_description_bill', label: 'Service Description' },
            { id: 'tax_components_bill', label: 'Tax Components' },
            { id: 'consumer_account_number_bill', label: 'Consumer/Account Number' },
          ],
        },
      ],
    },
    {
      id: 'audit_financial_reports',
      label: 'Audit Reports / Financial Statements',
      iconName: 'BookOpenCheck',
      primaryGoals: [
        {
          id: 'extract_financial_report_data',
          label: 'Extract Financial Report Data',
          suggestedDetails: [
            { id: 'entity_name_report', label: 'Entity Name' },
            { id: 'financial_year_report', label: 'Financial Year' },
            { id: 'auditor_name_firm', label: 'Auditor Name & Firm' },
            { id: 'balance_sheet_date', label: 'Balance Sheet Date' },
            { id: 'revenue', label: 'Revenue' },
            { id: 'expenses', label: 'Expenses' },
            { id: 'profit_before_after_tax', label: 'Profit Before/After Tax' },
            { id: 'equity', label: 'Equity' },
            { id: 'assets', label: 'Assets' },
            { id: 'liabilities', label: 'Liabilities' },
            { id: 'remarks_notes_to_accounts', label: 'Remarks / Notes to Accounts' },
          ],
        },
      ],
    },
    {
      id: 'tax_payment_challans',
      label: 'Challans (Tax Payment, PF, ESI, etc.)',
      iconName: 'FileCheck2',
      primaryGoals: [
        {
          id: 'extract_challan_data',
          label: 'Extract Challan Data',
          suggestedDetails: [
            { id: 'challan_number', label: 'Challan Number' },
            { id: 'date_of_payment_challan', label: 'Date of Payment' },
            { id: 'tax_type_gst_tds_advance', label: 'Tax Type (GST, TDS, Advance Tax)' },
            { id: 'amount_paid_challan', label: 'Amount Paid' },
            { id: 'bsr_code_cin', label: 'BSR Code / CIN' },
            { id: 'pan_tan_challan', label: 'PAN/TAN' },
            { id: 'assessment_year_challan', label: 'Assessment Year' },
            { id: 'period_covered_challan', label: 'Period Covered' },
          ],
        },
      ],
    },
    {
      id: 'registration_certs_pan_gst',
      label: 'PAN / GST / Registration Certificates',
      iconName: 'BadgeCheck',
      primaryGoals: [
        {
          id: 'extract_registration_cert_data',
          label: 'Extract Registration Certificate Data',
          suggestedDetails: [
            { id: 'entity_name_cert', label: 'Entity Name' },
            { id: 'pan_gstin_cert', label: 'PAN / GSTIN' },
            { id: 'registration_date_cert', label: 'Registration Date' },
            { id: 'type_of_business_cert', label: 'Type of Business' },
            { id: 'address_cert', label: 'Address' },
            { id: 'status_active_inactive_cert', label: 'Status (Active/Inactive)' },
          ],
        },
      ],
    },
    {
      id: 'loan_statements_emi',
      label: 'Loan Statements / EMI Schedules',
      iconName: 'CalendarClock',
      primaryGoals: [
        {
          id: 'extract_loan_data',
          label: 'Extract Loan Data',
          suggestedDetails: [
            { id: 'lender_name', label: 'Lender Name' },
            { id: 'borrower_name', label: 'Borrower Name' },
            { id: 'loan_account_number', label: 'Loan Account Number' },
            { id: 'disbursement_date', label: 'Disbursement Date' },
            { id: 'emi_amount', label: 'EMI Amount' },
            { id: 'interest_principal_split', label: 'Interest & Principal Split' },
            { id: 'due_dates_loan', label: 'Due Dates' },
            { id: 'outstanding_balance_loan', label: 'Outstanding Balance' },
          ],
        },
      ],
    },
    {
      id: 'general_text_summary',
      label: 'General Text Document (Summary)',
      iconName: 'FileText',
      primaryGoals: [
        {
          id: 'summarize_general_text',
          label: 'Summarize Text',
          suggestedDetails: [
            {id: 'key_points_summary', label: 'Key Points (concise)'},
            {id: 'main_ideas_summary', label: 'Main Ideas (bullet points)'},
            {id: 'overall_sentiment', label: 'Overall Sentiment (if applicable)'}
          ],
        },
      ],
    },
    {
      id: 'general_text_extraction',
      label: 'General Text Document (Extraction)',
      iconName: 'FileSearch',
      primaryGoals: [
        {
          id: 'extract_entities_general_text',
          label: 'Extract Named Entities',
          suggestedDetails: [
            {id: 'people_names', label: 'People Names'},
            {id: 'locations_places', label: 'Locations/Places'},
            {id: 'organizations_companies', label: 'Organizations/Companies'},
            {id: 'dates_times_mentioned', label: 'Dates/Times Mentioned'},
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
    { id: 'csv', label: 'CSV (for Excel/Tally Import)', iconName: 'FileSpreadsheet' },
    { id: 'list', label: 'Structured List (Key-Value Pairs)', iconName: 'ListOrdered' },
    { id: 'bullets', label: 'Bulleted Summary', iconName: 'List' },
  ],
  gmailScenarios: [
    {
      id: 'extractAttachments',
      label: 'Extract Attachments by Sender/Subject',
      description: 'Finds emails from a specific sender or with subject keywords (or both) and lists their attachments.',
      iconName: 'Paperclip',
      inputFields: [
        { id: 'senderEmail', label: 'Sender Email (Optional)', type: 'text', placeholder: 'e.g., newsletter@example.com' },
        { id: 'subjectKeywords', label: 'Subject Contains (Optional)', type: 'text', placeholder: 'e.g., "Monthly Report"' },
        { id: 'dateRange', label: 'Date Range', type: 'select', options: [ {value: 'last7days', label: 'Last 7 Days'}, {value: 'last30days', label: 'Last 30 Days'}, {value: 'allTime', label: 'All Time'} ], required: true, defaultValue: 'last7days' }
      ],
      basePromptTemplate: "List all attachments from emails {{#if senderEmail}}from:{{senderEmail}}{{/if}} {{#if subjectKeywords}}with subject:\"{{subjectKeywords}}\"{{/if}} received in:{{dateRange}}. For each email, list the email subject and the names of its attachments.",
      userGuide: "Provide either a sender email, subject keywords, or both. The more specific you are, the better the results. This prompt will ask Gemini to search your Gmail and list attachments from matching emails."
    },
    {
      id: 'summarizeEmails',
      label: 'Summarize Emails by Subject/Sender',
      description: 'Summarizes email threads based on subject keywords or from a specific sender.',
      iconName: 'MessagesSquare',
      inputFields: [
        { id: 'senderEmail', label: 'Sender Email (Optional)', type: 'text', placeholder: 'e.g., boss@example.com' },
        { id: 'subjectKeywords', label: 'Subject Contains (Optional)', type: 'text', placeholder: 'e.g., "Project Phoenix Update"' },
        { id: 'dateRange', label: 'Date Range', type: 'select', options: [ {value: 'last7days', label: 'Last 7 Days'}, {value: 'last30days', label: 'Last 30 Days'}, {value: 'allTime', label: 'All Time'} ], required: true, defaultValue: 'last7days' },
        { id: 'summaryLength', label: 'Summary Length', type: 'select', options: [ {value: 'brief', label: 'Brief'}, {value: 'detailed', label: 'Detailed'} ], required: true, defaultValue: 'brief' }
      ],
      basePromptTemplate: "Provide a {{summaryLength}} summary of emails {{#if senderEmail}}from:{{senderEmail}}{{/if}} {{#if subjectKeywords}}with subject:\"{{subjectKeywords}}\"{{/if}} received in:{{dateRange}}.",
      userGuide: "Specify sender, subject, or both to target emails. Choose 'brief' for a quick overview or 'detailed' for more depth."
    },
    {
        id: 'findClientCommunication',
        label: 'Find Client Communication History',
        description: 'Searches for all emails to or from a specific client, optionally filtered by keywords.',
        iconName: 'Users',
        inputFields: [
            { id: 'clientEmail', label: 'Client Email Address', type: 'text', placeholder: 'e.g., client@company.com', required: true },
            { id: 'keywords', label: 'Keywords (Optional)', type: 'text', placeholder: 'e.g., "contract" "invoice" "meeting"' },
            { id: 'dateRange', label: 'Date Range', type: 'select', options: [ {value: 'last30days', label: 'Last 30 Days'}, {value: 'last90days', label: 'Last 90 Days'}, {value: 'allTime', label: 'All Time'} ], required: true, defaultValue: 'last30days' }
        ],
        basePromptTemplate: "List all emails exchanged with {{clientEmail}} {{#if keywords}}containing keywords:\"{{keywords}}\"{{/if}} received in:{{dateRange}}. For each email, include sender, recipient, subject, and date.",
        userGuide: "Enter the client's email address. You can add keywords to narrow down the search (e.g., project name, specific terms)."
    }
  ],
};
