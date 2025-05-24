import React from 'react';
import Product from './types';

import { categories } from './types';

// Assuming categories are exported from types.tsx
export default function ProductTiles({ products }: { products: Product[] }) {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {categories.map((category) => (
                <div key={category} style={{ display: 'flex', width: '90%', flexDirection: 'column', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', background: '#f9f9f9', marginBottom: '16px' }}>
                    <h2>{category}</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
                        {products
                            .filter((product) => product.category === category)
                            .map((filteredProduct) => (
                                <div
                                    key={filteredProduct.product_ID}
                                    style={{
                                        display: 'flex',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        padding: '16px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                        background: '#fff',
                                        flexWrap: 'nowrap',
                                        alignContent: 'center',
                                        alignItems: 'center',
                                        justifyContent: 'space-evenly',
                                        flexDirection: 'row',
                                        width: '25%',
                                    }}>
                                    <div><img
                                        src={`/images/${filteredProduct.name.replace(/\s+/g, '_')}.jpg`} // Assuming images are named based on product names
                                        alt={filteredProduct.name}
                                        style={{ width: '100px', height: '100px', objectFit: 'cover', marginBottom: '8px' }}
                                    /></div>
                                    <div style={{ flexGrow: 1, paddingLeft: '12px' }}><h4>{filteredProduct.brand}</h4>
                                    <h3 style={{ fontSize: '1.1rem',  }}>{filteredProduct.name}</h3>
                                    <p style={{ color: '#888', margin: '0 0 8px' }}>${filteredProduct.price}</p></div>
                                </div>
                            ))}
                    </div>
                </div>
            ))}
        </div>
    );
}