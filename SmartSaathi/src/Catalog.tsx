import React, { useEffect } from "react";
import useCatalog from "./calls/queryDb";
import Chat from "./Chat";
import ProductTiles from "./Product";
import Product from "./types";
import Header from "./Header";

export default function Catalog() {

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
            <Header />
            <div style={{ display: 'flex', flexDirection: 'row', paddingTop: '1rem' }}>
                <ProductTiles products={rows} />
                <div>
                    <Chat />
                    <div className="feature">
                        <a href="/assistant">
                            <img src="/images/assistant.png" alt="Assistant Icon" style={{ width: '23rem', height: '23rem', borderRadius: '3rem', marginTop: '3rem', border: '5px black solid' }} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}