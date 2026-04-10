const axios = require('axios');

async function checkProductCount() {
    try {
        const response = await axios.get('https://sellsathi-refactored.onrender.com/products');
        const data = response.data;

        // Handle different response structures:
        // 1. { products: [], total: 100 }
        // 2. { data: [], count: 100 }
        // 3. [ ... ]

        let count = 0;
        let total = data.total || data.count || data.totalCount;
        let itemsCount = Array.isArray(data) ? data.length : (data.products?.length || data.data?.length || 0);

        console.log('--- API Response Metadata ---');
        console.log('Reported Total (from API metadata):', total || 'N/A');
        console.log('Items returned in first page:', itemsCount);

        // If it's a flat array, the total is just the length
        if (Array.isArray(data)) {
            console.log('Result: The backend returned a flat array of ' + data.length + ' products.');
        } else if (total) {
            console.log('Result: The backend reports a total of ' + total + ' products.');
        } else {
            console.log('Structure not explicitly totaled. Inspecting result keys: ' + Object.keys(data).join(', '));
        }

    } catch (error) {
        console.error('Error reaching backend:', error.message);
    }
}

checkProductCount();
