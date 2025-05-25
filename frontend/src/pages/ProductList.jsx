// src/EscrowComponent.js
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import contractABI from "./EscrowManager.json";

// --- CONFIGURATION ---
// 1. Replace with your contract's deployed address
const contractAddress = "0x449171266c439A2Ff35753a9d22b852D042aB4aF";
// 2. Replace with your contract's ABI (or import it)
// --- END CONFIGURATION ---

function EscrowComponent() {
    const [web3Instance, setWeb3Instance] = useState(null);
    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState(null);
    const [owner, setOwner] = useState(''); // To store the contract owner address

    // Form state for creating escrow
    const [buyerAddress, setBuyerAddress] = useState('');
    const [sellerAddress, setSellerAddress] = useState('');
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
        if (!buyerAddress || !sellerAddress || !escrowAmount) {
            setMessage("Please fill in all fields for creating escrow.");
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

    // --- Render JSX ---
    return (
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
                    <div>
                        <label>Amount (ETH): </label>
                        <input
                            type="number"
                            step="any" // Allow decimals
                            value={escrowAmount}
                            onChange={(e) => setEscrowAmount(e.target.value)}
                            placeholder="e.g., 0.1"
                            required
                            style={{ margin: '5px 0' }}
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
    );
}

export default EscrowComponent;
