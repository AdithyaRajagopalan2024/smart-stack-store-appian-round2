import React, { useEffect } from 'react';
import useCatalog from './calls/queryDb';

import Product from './types';
import ProductTiles from './Product';
import { categories } from './types';
import './App.css'; // Assuming you have some styles in App.css
import Chat from './Chat';

export default function App() {

  const [rows, setRows] = React.useState<Product[]>([]);
  const fetchCatalog = async () => {
    const response = await useCatalog();
    setRows(response?.data ?? []);
  };
  useEffect(() => {
    fetchCatalog();
  }, []);

  return (
    <div style={{
      textAlign: 'center', backgroundColor: 'rgb(119 137 244)',
      borderRadius: '10px',
      height: '8rem',
      marginBottom: '20px'
    }}>
      {/* <div style={{ display: 'flex', padding: '1.5rem', flexDirection: 'column' }}> */}
        <div style={{ display: 'flex', flexDirection: 'row' , width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <img src={`/images/header.jpg`} alt="Logo" style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginLeft: '20px' }}>
            <h2>Smart Stack Store</h2>
            <h3>Product Catalog</h3>
          </div>
        </div>
      {/* </div> */}
      <div style={{ display: 'flex', flexDirection: 'row', paddingTop: '1rem' }}>
        <ProductTiles products={rows} />
        <Chat/>
      </div>
    </div>
  );

}