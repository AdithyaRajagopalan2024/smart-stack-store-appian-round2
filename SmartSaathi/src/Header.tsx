export default function Header(){
    return (<div style={{ display: 'flex', flexDirection: 'row' , width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <img src={`/images/header.jpg`} alt="Logo" style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginLeft: '20px' }}>
            <h1>Smart Stack Store</h1>
            <h2>Product Catalog</h2>
          </div>
        </div>);
}