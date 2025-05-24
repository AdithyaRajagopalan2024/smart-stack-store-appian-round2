type Product = {
  product_ID: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  stock: number;
  warranty_years: number;
  rating: string;
};

export const categories: string[] = [
    'Smart Home',
    'Accessories',
    'Headphones',
    'Smartphone',
    'Laptop',
    'Television',
    'Speaker',
    'Earbuds',
    'Smartwatch',
    'Gaming Console',
    'Projector',
    'Camera',
    'Tablet',
    'Storage',
    'Monitor',
    'Fitness',
];

export default Product;

