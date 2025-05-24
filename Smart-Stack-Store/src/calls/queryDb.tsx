import axios from 'axios';
import { useState } from 'react';

const useCatalog = async () => {

    try {
        const response = await axios.get('http://localhost:8080/getproductCatalog'); // Replace with your actual API endpoint

        console.log(response);
        return response;
    } catch (error) {
        console.error('Error fetching catalog:', error);
    }
};

export default useCatalog;