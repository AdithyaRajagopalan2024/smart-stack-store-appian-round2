import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import useCatalog from './calls/queryDb';

import Product from './types';
import ProductTiles from './Product';
import { categories } from './types';
import './App.css'; // Assuming you have some styles in App.css
import Chat from './Chat';
import Catalog from './Catalog';
import ChatGemini from './ChatGemini';

export default function App() {



  return (
    

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Catalog />} index />
        <Route path="/assistant" element={<ChatGemini />} />
        {/* <Route path="/students" element={<Student />} /> */}
        {/* <Route path="/vaccination-drives" element={<VaccinationDrives />} /> */}
        {/* <Route path="/vaccines" element={<Vaccines />} /> */}
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );

}