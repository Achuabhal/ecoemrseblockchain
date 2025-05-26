import React, { useState, useEffect  } from 'react';
import api from '../conection/axios';
import { Link } from 'react-router-dom';


function ProductForm() {
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    category: '',
    account: ''
  });

  const [account, setAccount] = useState(null);
  const [fetchedProduct, setFetchedProduct] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(accounts => {
          if (accounts.length > 0) setAccount(accounts[0]);
        })
        .catch(err => console.error("Error connecting to MetaMask:", err));
    } else {
      console.warn("MetaMask not detected. Cannot connect wallet.");
    }
  }, []);

  useEffect(() => {
    if (account) {
      setProduct(prev => ({ ...prev, account }));
    }
  }, [account]);

  useEffect(() => {
    const fetchData = async () => {
      if (!account) {
        setFetchedProduct(null);
        return;
      }

      try {
        const response = await api.post('/api/product', { account });
        setFetchedProduct(response.data || null);
      } catch (err) {
        console.error('Error fetching product:', err);
        setFetchedProduct(null);
      }
    };

    fetchData();
  }, [account]);

  const handleChange = ({ target: { name, value } }) => {
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product.name || !product.description || !product.price || !product.imageUrl || !product.category || !product.account) {
      alert("Please fill in all product details and connect your wallet.");
      return;
    }

    try {
      const res = await api.post('/api', product);
      alert('Product Saved Successfully!');
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Failed to save product. Check console for details.');
    }
  };

  const containerStyle = {
    maxWidth: '600px',
    margin: '30px auto',
    padding: '20px',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Arial, sans-serif'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontSize: '14px'
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#4CAF50',
    color: 'white',
    fontSize: '16px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '10px'
  };

  const sectionTitle = {
    fontSize: '20px',
    marginBottom: '12px',
    color: '#333'
  };

  const imageStyle = {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '8px',
    marginTop: '10px'
  };

  return (
    <div style={containerStyle}>
      <h2 style={sectionTitle}>Add New Product</h2>
      <form onSubmit={handleSubmit}>
        <p><strong>Account:</strong> {account || 'Connecting to MetaMask...'}</p>
        {!account && <p style={{ color: 'red' }}>Please connect your MetaMask wallet.</p>}

        <input name="name" style={inputStyle} value={product.name} onChange={handleChange} placeholder="Product Name" required />
        <textarea name="description" style={{ ...inputStyle, height: '80px' }} value={product.description} onChange={handleChange} placeholder="Description" required />
        <input name="price" type="number" style={inputStyle} value={product.price} onChange={handleChange} placeholder="Price" min="0" step="0.01" required />
        <input name="imageUrl" type="url" style={inputStyle} value={product.imageUrl} onChange={handleChange} placeholder="Image URL" required />
        <input name="category" style={inputStyle} value={product.category} onChange={handleChange} placeholder="Category" required />

        <button type="submit" style={buttonStyle} disabled={!account}>Save Product</button>
      </form>
    <Link to="/test">
              <button type="submit" style={buttonStyle} disabled={!account}>see orders</button>
    </Link>
    </div>
  );
}

export default ProductForm;
