import { LightningElement } from 'lwc';

export default class PdfGenerationDemo extends LightningElement {

    invoiceData = {
        invoiceNumber: 'INV-1001',
        date: '2025-06-15',
        dueDate: '2025-07-01',
        billTo: {
            name: 'Jane Doe',
            company: 'Doe Enterprises',
            address: '123 Business Ave, Suite 400',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            country: 'USA',
            email: 'jane.doe@example.com',
        },
        items: [
            {
                description: 'Website Design',
                quantity: 1,
                unitPrice: 1500.00,
                total: 1500.00
            },
            {
                description: 'Hosting (1 year)',
                quantity: 1,
                unitPrice: 120.00,
                total: 120.00
            },
            {
                description: 'Domain Registration',
                quantity: 1,
                unitPrice: 15.00,
                total: 15.00
            }
        ],
        subtotal: 1635.00,
        taxRate: 0.08,
        taxAmount: 130.80,
        totalAmount: 1765.80,
        paymentStatus: 'Unpaid',
        notes: 'Please make payment by the due date. Late payments may incur a fee.',
    };


}