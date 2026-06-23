document.addEventListener('DOMContentLoaded', () => {
    // State
    let items = [
        { id: 1, desc: 'Web Design (Maximalist)', qty: 1, price: 1500 }
    ];

    // Elements
    const form = document.getElementById('invoice-form');
    const itemsContainer = document.getElementById('items-container');
    const addItemBtn = document.getElementById('add-item-btn');
    const printBtn = document.getElementById('print-btn');

    // Mappings for simple text fields
    const mappings = {
        'sender-name': 'preview-sender-name',
        'sender-email': 'preview-sender-email',
        'sender-address': 'preview-sender-address',
        'client-name': 'preview-client-name',
        'client-email': 'preview-client-email',
        'client-address': 'preview-client-address',
        'invoice-number': 'preview-invoice-number',
        'invoice-date': 'preview-invoice-date',
        'notes': 'preview-notes',
        'tax-rate': 'preview-tax-rate'
    };

    // Initialize listeners
    function init() {
        // Setup input listeners for mappings
        for (const [inputId, previewId] of Object.entries(mappings)) {
            const inputEl = document.getElementById(inputId);
            inputEl.addEventListener('input', () => updatePreview(inputId, previewId));
            // Trigger initial update
            updatePreview(inputId, previewId);
        }

        addItemBtn.addEventListener('click', addItem);
        printBtn.addEventListener('click', () => window.print());

        renderItems();
    }

    // Update simple fields
    function updatePreview(inputId, previewId) {
        const val = document.getElementById(inputId).value;
        document.getElementById(previewId).textContent = val || ' ';
        if (inputId === 'tax-rate') {
            calculateTotals();
        }
    }

    // Add new item
    function addItem() {
        const newItem = {
            id: Date.now(),
            desc: '',
            qty: 1,
            price: 0
        };
        items.push(newItem);
        renderItems();
    }

    // Remove item
    function removeItem(id) {
        items = items.filter(item => item.id !== id);
        renderItems();
    }

    // Render item inputs
    function renderItems() {
        itemsContainer.innerHTML = '';
        
        items.forEach((item, index) => {
            const row = document.createElement('div');
            row.className = 'item-row';
            
            row.innerHTML = `
                <input type="text" class="item-desc" placeholder="Description" value="${item.desc}" data-id="${item.id}" data-field="desc">
                <input type="number" class="item-qty" placeholder="Qty" value="${item.qty}" min="1" data-id="${item.id}" data-field="qty">
                <input type="number" class="item-price" placeholder="Price" value="${item.price}" min="0" data-id="${item.id}" data-field="price">
                <button type="button" class="remove-btn" data-id="${item.id}">X</button>
            `;
            
            itemsContainer.appendChild(row);
        });

        // Add event listeners to new elements
        itemsContainer.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', handleItemInput);
        });
        
        itemsContainer.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                removeItem(parseInt(e.target.getAttribute('data-id')));
            });
        });

        renderPreviewItems();
    }

    // Handle item input changes
    function handleItemInput(e) {
        const id = parseInt(e.target.getAttribute('data-id'));
        const field = e.target.getAttribute('data-field');
        const val = e.target.value;

        const item = items.find(i => i.id === id);
        if (item) {
            item[field] = field === 'desc' ? val : parseFloat(val) || 0;
            renderPreviewItems();
        }
    }

    // Format currency
    function formatCurrency(amount) {
        return '$' + parseFloat(amount).toFixed(2);
    }

    // Render items in preview
    function renderPreviewItems() {
        const tbody = document.getElementById('preview-items-body');
        tbody.innerHTML = '';

        items.forEach(item => {
            const total = item.qty * item.price;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.desc || '...'}</td>
                <td>${item.qty}</td>
                <td>${formatCurrency(item.price)}</td>
                <td>${formatCurrency(total)}</td>
            `;
            tbody.appendChild(tr);
        });

        calculateTotals();
    }

    // Calculate subtotal, tax, and grand total
    function calculateTotals() {
        const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
        
        const taxRateInput = document.getElementById('tax-rate').value;
        const taxRate = parseFloat(taxRateInput) || 0;
        
        const taxAmount = subtotal * (taxRate / 100);
        const grandTotal = subtotal + taxAmount;

        document.getElementById('preview-subtotal').textContent = formatCurrency(subtotal);
        document.getElementById('preview-tax-amount').textContent = formatCurrency(taxAmount);
        document.getElementById('preview-grand-total').textContent = formatCurrency(grandTotal);
    }

    init();
});
