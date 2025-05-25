"use client"

import { use, useEffect, useState } from "react"
import { CiShoppingCart } from "react-icons/ci";
import api from '../conection/axios';
import Web3 from 'web3';
import contractABI from "./EscrowManager.json";
import i from "./image.png"


const contractAddress = "0x449171266c439A2Ff35753a9d22b852D042aB4aF";





export default function EcommercePage() {


  const [web3Instance, setWeb3Instance] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [owner, setOwner] = useState(''); // To store the contract owner address

  // Form state for creating escrow
  const [buyerAddress, setBuyerAddress] = useState('');
  const sellerAddress ="0x15e6F7d05dF07988E48444A61E9615558dA6f186"
  
  const [escrowAmount, setEscrowAmount] = useState(''); // Amount in ETH


  // Form state for confirming delivery
  const [escrowIdToConfirm, setEscrowIdToConfirm] = useState('');

  // UI Feedback
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Effect to initialize Web3 and connect wallet listeners
  useEffect(() => {
      if (window.ethereum) {
          // Create a new web3 instance using the provider from MetaMask
          const web3 = new Web3(window.ethereum);
          setWeb3Instance(web3);

          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts) => {
              console.log("Accounts changed:", accounts);
              if (accounts.length > 0) {
                  connectWallet(); // Reconnect or update state
              } else {
                  // Handle disconnection
                  setAccount(null);
                  setContract(null);
                  setMessage("Wallet disconnected.");
              }
          });

          // Listen for network changes
          window.ethereum.on('chainChanged', (chainId) => {
              console.log("Network changed:", chainId);
              // Reload or prompt user to switch network as the contract might not be on the new one
              window.location.reload();
          });

      } else {
          setMessage("Please install MetaMask or another Ethereum wallet!");
      }
  }, []); // Runs once on component mount

  // Effect to fetch the contract owner once the contract instance is ready
  useEffect(() => {
      const fetchOwner = async () => {
          if (contract) {
              try {
                  const contractOwner = await contract.methods.owner().call();
                  setOwner(contractOwner);
              } catch (error) {
                  console.error("Error fetching contract owner:", error);
                  setMessage("Could not fetch contract owner.");
              }
          }
      };
      fetchOwner();
  }, [contract]);

  // Function to connect wallet and initialize contract
  const connectWallet = async () => {
      if (!web3Instance) {
          setMessage("Web3 provider not initialized. Ensure MetaMask is installed.");
          return;
      }
      try {
          // Request account access
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          if (accounts.length > 0) {
              const currentAccount = accounts[0];
              setAccount(currentAccount);
              setBuyerAddress(currentAccount)
              setMessage(`Wallet connected: ${currentAccount.substring(0, 6)}...${currentAccount.substring(currentAccount.length - 4)}`);

              // Create contract instance
              const escrowContract = new web3Instance.eth.Contract(contractABI.abi, contractAddress);
              setContract(escrowContract);
              console.log("Contract instance created:", contractAddress);
          } else {
              setMessage("No accounts found. Please unlock your wallet.");
          }
      } catch (error) {
          console.error("Error connecting wallet:", error);
          setMessage(`Error connecting: ${error.message}`);
      }
  };

  // --- Contract Interaction Functions ---

  const handleCreateEscrow = async (event) => {
      event.preventDefault();
      if (!contract || !account) {
          setMessage("Please connect your wallet first.");
          return;
      }
      const escrowAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);
      if (!buyerAddress || !sellerAddress || escrowAmount <= 0) {
          setMessage("Please fill in all fields for creating escrow and ensure the amount is greater than zero.");
          return;
      }
      // Validate Ethereum addresses using web3's utility
      if (!web3Instance.utils.isAddress(buyerAddress) || !web3Instance.utils.isAddress(sellerAddress)) {
          setMessage("Invalid Buyer or Seller address format.");
          return;
      }

      setLoading(true);
      setMessage("Creating escrow... Please confirm the transaction in your wallet.");

      try {
          // Convert amount from Ether to Wei
          const amountInWei = web3Instance.utils.toWei(escrowAmount, 'ether');

          // Call the contract's createEscrow method
          const tx = contract.methods.createEscrow(buyerAddress, sellerAddress);
          const gas = await tx.estimateGas({ from: account, value: amountInWei });
          const txReceipt = await tx.send({
              from: account,
              gas,
              value: amountInWei
          })
          .on('transactionHash', (hash) => {
              setMessage(`Transaction sent! Hash: ${hash}. Waiting for confirmation...`);
              console.log("Transaction sent:", hash);
          });
          
          setMessage(`Escrow created successfully! Transaction confirmed: ${txReceipt.transactionHash}`);
          console.log("Transaction confirmed:", txReceipt);
          
          // Clear form fields
          setBuyerAddress('');
          setSellerAddress('');
          setEscrowAmount('');

          // Optionally: Fetch next escrow ID or additional details here

      } catch (error) {
          console.error("Error creating escrow:", error);
          setMessage(`Error creating escrow: ${error.message || error}`);
      } finally {
          setLoading(false);
      }
  };

  const handleConfirmDelivery = async (event) => {
      event.preventDefault();
      if (!contract || !account) {
          setMessage("Please connect your wallet first.");
          return;
      }
      if (!escrowIdToConfirm) {
          setMessage("Please enter the Escrow ID to confirm delivery.");
          return;
      }

      // Frontend check: Only the contract owner is allowed to confirm delivery
      if (account && owner && account.toLowerCase() !== owner.toLowerCase()) {
          setMessage("Only the contract owner can confirm delivery.");
          return;
      }

      setLoading(true);
      setMessage(`Confirming delivery for Escrow ID: ${escrowIdToConfirm}... Confirm transaction.`);

      try {
          const tx = contract.methods.confirmDelivery(escrowIdToConfirm);
          const gas = await tx.estimateGas({ from: account });
          const txReceipt = await tx.send({ from: account, gas })
          .on('transactionHash', (hash) => {
              setMessage(`Transaction sent! Hash: ${hash}. Waiting for confirmation...`);
              console.log("Transaction sent:", hash);
          });
          
          setMessage(`Delivery confirmed successfully for Escrow ID: ${escrowIdToConfirm}! Tx: ${txReceipt.transactionHash}`);
          console.log("Transaction confirmed:", txReceipt);
          setEscrowIdToConfirm(''); // Clear form

      } catch (error) {
          console.error("Error confirming delivery:", error);
          setMessage(`Error confirming delivery: ${error.message || error}`);
      } finally {
          setLoading(false);
      }
  };






  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get('/api')
      .then(response => {
        setProducts(response.data);
        console.log(response.data)
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });
  }, []);
 
  // Sample product data
  

  // State management
  const [cart, setCart] = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [showCheckout, setShowCheckout] = useState(false)
  const [showCart, setShowCart] = useState(false)

  // Get unique categories
  const categories = ["All", ...new Set(products.map((product) => product.category))]

  // Filter products by category and search query
  const filteredProducts = products.filter((product) => {
    const matchesCategory = categoryFilter === "All" || product.category === categoryFilter
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Cart functions
  const addToCart = (product) => {
    
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product._id)
      console.log(cart)
      if (existingItem) {
        return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      } else {
        return [...prevCart, { ...product, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return
    setCart((prevCart) => prevCart.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item)))
  }

  // Calculate cart totals
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)

  return (
    <>
    
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN"
          crossOrigin="anonymous"
        />
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL"
          crossOrigin="anonymous"
          defer
        ></script>
      

      <div className="min-vh-100 d-flex flex-column">
        {/* Header */}
        <header className="sticky-top bg-white border-bottom">
          <div className="container py-3">
            <div className="d-flex justify-content-between align-items-center">
              {/* Logo */}
              <div className="fs-4 fw-bold">Eth Pay</div>

              {/* Desktop Navigation */}
              <nav className="d-none d-md-flex">
                <ul className="nav">
                  <li className="nav-item">
                    <a href="#" className="nav-link">
                      Home
                    </a>
                  </li>
                  <li className="nav-item">
                    <a href="#" className="nav-link">
                      Shop
                    </a>
                  </li>
                  <li className="nav-item">
                    <a href="#" className="nav-link">
                      About
                    </a>
                  </li>
                  <li className="nav-item">
                    <a href="#" className="nav-link">
                      Contact
                    </a>
                  </li>
                </ul>
              </nav>

              {/* Search, Cart, and Mobile Menu */}
              <div className="d-flex align-items-center">
                <div className="d-none d-md-block me-3 position-relative">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="position-relative me-3">
                  <button
                    className="btn btn-outline-secondary position-relative"
                    onClick={() => setShowCart(!showCart)}
                  >
                     <CiShoppingCart size={24} />
                    <i className="bi bi-cart"></i>
                    {cartItemCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {cartItemCount}
                      </span>
                    )}
                  </button>

                  {/* Cart Dropdown */}
                  {showCart && (
                    <div
                      className="position-absolute end-0 mt-2 p-3 bg-white border rounded shadow"
                      style={{ width: "320px", zIndex: 1000 }}
                    >
                      <h5 className="mb-3">Your Cart ({cartItemCount} items)</h5>

                      {cart.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-muted">Your cart is empty</p>
                          <button className="btn btn-outline-primary mt-2" onClick={() => setShowCart(false)}>
                            Continue Shopping
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="overflow-auto" style={{ maxHeight: "300px" }}>
                            {cart.map((item) => (
                              <div key={item.id} className="d-flex py-2 border-bottom">
                                <img
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.name}
                                  className="img-fluid rounded"
                                  style={{ width: "60px", height: "60px", objectFit: "cover" }}
                                />
                                <div className="ms-3 flex-grow-1">
                                  <h6 className="mb-0">{item.name}</h6>
                                  <p className="small text-muted mb-1">${item.price.toFixed(2)}</p>
                                  <div className="d-flex align-items-center">
                                    <button
                                      className="btn btn-sm btn-outline-secondary"
                                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    >
                                      -
                                    </button>
                                    <span className="mx-2">{item.quantity}</span>
                                    <button
                                      className="btn btn-sm btn-outline-secondary"
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    >
                                      +
                                    </button>
                                    <button
                                      className="btn btn-sm text-danger ms-auto"
                                      onClick={() => removeFromCart(item.id)}
                                    >
                                      <i className="bi bi-x"></i>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="border-top pt-3 mt-3">
                            <div className="d-flex justify-content-between mb-3">
                              <span className="fw-medium">Total</span>
                              <span className="fw-bold">${cartTotal.toFixed(2)}</span>
                            </div>
                            <button
                              className="btn btn-primary w-100"
                              onClick={() => {
                                setShowCheckout(true)
                                setShowCart(false)
                              }}
                            >
                              Checkout
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  className="btn btn-outline-secondary d-md-none"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <i className="bi bi-list"></i>
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="d-md-none mt-3 pb-3">
                <nav className="nav flex-column mb-3">
                  <a href="#" className="nav-link">
                    Home
                  </a>
                  <a href="#" className="nav-link">
                    Shop
                  </a>
                  <a href="#" className="nav-link">
                    About
                  </a>
                  <a href="#" className="nav-link">
                    Contact
                  </a>
                </nav>
                <div className="position-relative">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow-1 container py-4">
          {showCheckout ? (
            <div className="mx-auto" style={{ maxWidth: "768px" }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fs-3 fw-bold">Checkout</h2>
                <button className="btn btn-link" onClick={() => setShowCheckout(false)}>
                  Back to Shopping
                </button>
              </div>

              <div className="bg-light p-4 rounded mb-4">
                <h5 className="fw-medium mb-3">Order Summary</h5>
                {cart.map((item) => (
                  <div key={item.id} className="d-flex justify-content-between py-2">
                    <span>
                      {item.quantity} x {item.name}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <hr className="my-2" />
                <div className="d-flex justify-content-between fw-bold">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="mb-3">Shipping Information</h4>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">First Name</label>
                    <input type="text" className="form-control" placeholder="John" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Last Name</label>
                    <input type="text" className="form-control" placeholder="Doe" />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Address</label>
                    <input type="text" className="form-control" placeholder="123 Main St" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">City</label>
                    <input type="text" className="form-control" placeholder="New York" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Postal Code</label>
                    <input type="text" className="form-control" placeholder="10001" />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" placeholder="john.doe@example.com" />
                  </div>
                </div>
              </div>

              <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>Escrow Manager Interaction</h1>

            {!account ? (
                <button onClick={connectWallet}>Connect Wallet</button>
            ) : (
                <div>
                    <p>Connected Account: {account}</p>
                    <p>Contract Owner: {owner || 'Loading...'}</p>
                    <p>Contract Address: {contractAddress}</p>
                </div>
            )}

            <hr style={{ margin: '20px 0' }} />

            {/* Create Escrow Form */}
            {contract && (
                <form onSubmit={handleCreateEscrow}>
                    <h2>Create New Escrow</h2>
                    <div>
                        <label>Buyer Address: </label>
                        <input
                            type="text"
                            value={buyerAddress}
                            onChange={(e) => setBuyerAddress(e.target.value)}
                            placeholder="0x..."
                            required
                            style={{ width: '300px', margin: '5px 0' }}
                        />
                    </div>
                     <div>
                        <label>Seller Address: </label>
                        <input
                            type="text"
                            value={sellerAddress}
                            onChange={(e) => setSellerAddress(e.target.value)}
                            placeholder="0x..."
                            required
                            style={{ width: '300px', margin: '5px 0' }}
                        />
                    </div>
                  
                    <button type="submit" disabled={loading}>
                        {loading ? 'Processing...' : 'Create Escrow'}
                    </button>
                </form>
            )}

            <hr style={{ margin: '20px 0' }} />

            {/* Confirm Delivery Form */}
            {contract && (
                <form onSubmit={handleConfirmDelivery}>
                    <h2>Confirm Delivery (Owner Only)</h2>
                    {account && owner && account.toLowerCase() !== owner.toLowerCase() && (
                        <p style={{color: 'orange'}}>Warning: You are not the contract owner.</p>
                    )}
                    <div>
                        <label>Escrow ID: </label>
                        <input
                            type="number"
                            value={escrowIdToConfirm}
                            onChange={(e) => setEscrowIdToConfirm(e.target.value)}
                            placeholder="Enter Escrow ID"
                            required
                            style={{ margin: '5px 0' }}
                        />
                    </div>
                    <button type="submit" disabled={loading || (account && owner && account.toLowerCase() !== owner.toLowerCase())}>
                        {loading ? 'Processing...' : 'Confirm Delivery'}
                    </button>
                </form>
            )}

            {/* Message Area */}
            {message && (
                <div style={{ marginTop: '20px', padding: '10px', border: '1px solid grey', background: '#f0f0f0' }}>
                    <strong>Status:</strong> {message}
                </div>
            )}
        </div>

              <button className="btn btn-primary w-100 py-2">Complete Order</button>
            </div>
          ) : (
            <>
              {/* Hero Section */}
              <section className="mb-5">
                <div className="position-relative rounded overflow-hidden">
                  <div className="position-absolute top-0 start-0 w-100 h-100 bg-primary bg-opacity-50"></div>
                  <img
                    src={i}
                    alt="Hero"
                    className="w-100 object-fit-cover"
                    style={{ height: "400px" }}
                  />
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center p-4 text-white">
                    <div className="container">
                      <h1 className="display-5 fw-bold mb-3">Summer Collection 2025</h1>
                      <p className="fs-5 mb-4 col-md-8">
                        Discover our latest products with amazing discounts up to 50% off.
                      </p>
                      <button className="btn btn-light btn-lg">Shop Now</button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Category and Filter */}
              <section className="mb-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
                  <h2 className="fs-3 fw-bold mb-3 mb-md-0">Our Products</h2>
                  <div className="d-flex flex-column flex-sm-row gap-2">
                    <select
                      className="form-select"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      style={{ width: "180px" }}
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>

                    <select className="form-select" style={{ width: "180px" }}>
                      <option value="featured">Featured</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="newest">Newest</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Product Grid */}
              <section className="mb-5">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="fs-5 text-muted">No products found. Try a different search or category.</p>
                  </div>
                ) : (
                  <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                    {filteredProducts.map((product) => (
                      <div key={product.id} className="col">
                        <div className="card h-100">
                          <div className="position-relative">
                            <img
                              src={product.
                                imageUrl                                 || "/placeholder.svg"}
                              alt={product.name}
                              className="card-img-top"
                              style={{ height: "200px", objectFit: "cover" }}
                            />
                            <button className="btn btn-light position-absolute top-0 end-0 m-2 rounded-circle">
                              <i className="bi bi-heart"></i>
                            </button>
                          </div>
                          <div className="card-body">
                            <div className="d-flex justify-content-between mb-2">
                              <span className="text-muted small">{product.category}</span>
                              <span className="fw-medium">${product.price.toFixed(2)}</span>
                            </div>
                            <h5 className="card-title">{product.name}</h5>
                            <p className="card-text text-muted small">{product.description}</p>
                          </div>
                          <div className="card-footer bg-transparent border-top-0">
                          <button className="btn btn-primary w-100" onClick={() => addToCart(product)}>
  <CiShoppingCart className="me-2" /> Add to Cart
</button>

                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Features */}
              <section className="mb-5">
                <div className="row row-cols-1 row-cols-md-3 g-4">
                  <div className="col">
                    <div className="card h-100 text-center p-4">
                      <div
                        className="mx-auto mb-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle"
                        style={{ width: "64px", height: "64px" }}
                      >
                        <i className="bi bi-truck fs-4"></i>
                      </div>
                      <h5 className="card-title">Free Shipping</h5>
                      <p className="card-text text-muted">Free shipping on all orders over $50</p>
                    </div>
                  </div>

                  <div className="col">
                    <div className="card h-100 text-center p-4">
                      <div
                        className="mx-auto mb-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle"
                        style={{ width: "64px", height: "64px" }}
                      >
                        <i className="bi bi-shield-check fs-4"></i>
                      </div>
                      <h5 className="card-title">Secure Payment</h5>
                      <p className="card-text text-muted">100% secure payment processing</p>
                    </div>
                  </div>

                  <div className="col">
                    <div className="card h-100 text-center p-4">
                      <div
                        className="mx-auto mb-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle"
                        style={{ width: "64px", height: "64px" }}
                      >
                        <i className="bi bi-arrow-counterclockwise fs-4"></i>
                      </div>
                      <h5 className="card-title">Easy Returns</h5>
                      <p className="card-text text-muted">30-day return policy for all items</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Newsletter */}
              <section className="bg-light p-4 p-md-5 rounded mb-5">
                <div className="text-center mx-auto" style={{ maxWidth: "600px" }}>
                  <h2 className="fs-3 fw-bold mb-3">Subscribe to Our Newsletter</h2>
                  <p className="text-muted mb-4">Get the latest updates on new products and upcoming sales.</p>
                  <div className="row g-2">
                    <div className="col-sm">
                      <input type="email" className="form-control" placeholder="Enter your email" />
                    </div>
                    <div className="col-sm-auto">
                      <button className="btn btn-primary w-100">Subscribe</button>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-light mt-auto">
          <div className="container py-5">
            <div className="row g-4">
              <div className="col-lg-3 col-md-6">
                <h5 className="fw-bold mb-3">Eth Pay</h5>
                <p className="text-muted mb-3">
                  Your one-stop shop for all your needs. Quality products at affordable prices.
                </p>
                <div className="d-flex gap-3">
                  <a href="#" className="text-muted">
                    <i className="bi bi-facebook"></i>
                  </a>
                  <a href="#" className="text-muted">
                    <i className="bi bi-twitter"></i>
                  </a>
                  <a href="#" className="text-muted">
                    <i className="bi bi-instagram"></i>
                  </a>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <h5 className="fw-bold mb-3">Shop</h5>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <a href="#" className="text-decoration-none text-muted">
                      All Products
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="#" className="text-decoration-none text-muted">
                      New Arrivals
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="#" className="text-decoration-none text-muted">
                      Best Sellers
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="#" className="text-decoration-none text-muted">
                      Sale
                    </a>
                  </li>
                </ul>
              </div>

              <div className="col-lg-3 col-md-6">
                <h5 className="fw-bold mb-3">Support</h5>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <a href="#" className="text-decoration-none text-muted">
                      Contact Us
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="#" className="text-decoration-none text-muted">
                      FAQs
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="#" className="text-decoration-none text-muted">
                      Shipping & Returns
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="#" className="text-decoration-none text-muted">
                      Track Order
                    </a>
                  </li>
                </ul>
              </div>

              <div className="col-lg-3 col-md-6">
                <h5 className="fw-bold mb-3">Contact</h5>
                <address className="text-muted">
                  <p>123 Commerce St.</p>
                  <p>New York, NY 10001</p>
                  <p>Email: support@Eth Pay.com</p>
                  <p>Phone: (123) 456-7890</p>
                </address>
              </div>
            </div>

            <div className="border-top mt-4 pt-4 d-flex flex-column flex-md-row justify-content-between align-items-center">
              <p className="text-muted small mb-3 mb-md-0">
                &copy; {new Date().getFullYear()} Eth Pay. All rights reserved.
              </p>
              <div className="d-flex gap-3">
                <a href="#" className="text-decoration-none text-muted small">
                  Privacy Policy
                </a>
                <a href="#" className="text-decoration-none text-muted small">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
