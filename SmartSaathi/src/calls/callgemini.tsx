import axios from 'axios';
import { useState } from 'react';

const useGemini = async () => {

    try {
        const response = await axios.post('http://localhost:8080/sendQuery', {
            query: 'your_query_here'
        });

        console.log(response);
        return response;
    } catch (error) {
        console.error('Error sending Query:', error);
    }
};

export default useGemini;