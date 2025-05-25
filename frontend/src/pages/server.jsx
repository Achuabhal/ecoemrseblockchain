"use client";

import React, { useState, useEffect } from "react";
import Web3 from "web3";
import contractABI from "./EscrowManager.json";

const contractAddress = "0x449171266c439A2Ff35753a9d22b852D042aB4aF";

export default function ConfirmDelivery() {
  const [web3Instance, setWeb3Instance] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [owner, setOwner] = useState("");
  const [escrows, setEscrows] = useState([]);
  const [escrowIdToConfirm, setEscrowIdToConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize Web3 and contract on mount
  useEffect(() => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      setWeb3Instance(web3);

      const escrowContract = new web3.eth.Contract(contractABI.abi, contractAddress);
      setContract(escrowContract);

      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      });

      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setMessage(`Wallet connected: ${accounts[0]}`);
        } else {
          setAccount(null);
          setMessage("Wallet disconnected");
        }
      });

      escrowContract.methods.owner().call()
        .then((ownerAddress) => {
          setOwner(ownerAddress);
        })
        .catch(() => setMessage("Could not fetch contract owner"));
    } else {
      setMessage("Please install MetaMask!");
    }
  }, []);

  // Fetch all escrows whenever contract changes or after confirming delivery
  useEffect(() => {
    const fetchEscrows = async () => {
      if (!contract) return;

      try {
        const totalEscrows = await contract.methods.nextEscrowId().call();
        const escrowList = [];
        for (let i = 0; i < totalEscrows; i++) {
          const escrowData = await contract.methods.escrows(i).call();
          escrowList.push({ id: i, ...escrowData });
        }

        setEscrows(escrowList);
        if (escrowList.length === 0) setMessage("No escrows found.");
        else setMessage("");
      } catch (error) {
        setMessage(`Error fetching escrows: ${error.message || error.toString()}`);
      }
    };

    fetchEscrows();
  }, [contract, loading]);

  // Function to connect wallet manually
  const connectWallet = async () => {
    if (!web3Instance) {
      setMessage("Web3 not initialized.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setMessage(`Wallet connected: ${accounts[0]}`);
      }
    } catch (error) {
      setMessage(`Error connecting wallet: ${error.message}`);
    }
  };

  // Confirm delivery handler
  const handleConfirmDelivery = async (e) => {
    e.preventDefault();

    if (!contract || !account) {
      setMessage("Please connect your wallet first.");
      return;
    }

    if (escrowIdToConfirm === "") {
      setMessage("Please select an Escrow ID.");
      return;
    }

    if (account.toLowerCase() !== owner.toLowerCase()) {
      setMessage("Only contract owner can confirm delivery.");
      return;
    }

    setLoading(true);
    setMessage(`Confirming delivery for Escrow ID: ${escrowIdToConfirm}. Please confirm transaction.`);

    try {
      const tx = contract.methods.confirmDelivery(escrowIdToConfirm);
      const gas = await tx.estimateGas({ from: account });
      const receipt = await tx.send({ from: account, gas })
        .on("transactionHash", (hash) => {
          setMessage(`Transaction sent: ${hash}`);
        });

      setMessage(`Delivery confirmed! Tx Hash: ${receipt.transactionHash}`);
      setEscrowIdToConfirm("");
    } catch (error) {
      setMessage(`Transaction failed: ${error.message || error.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Escrow Manager</h1>
        <div style={styles.walletStatus}>
          {!account ? (
            <button style={styles.connectButton} onClick={connectWallet}>
              Connect Wallet
            </button>
          ) : (
            <p style={styles.connectedAccount}>
              Connected: {account.slice(0, 6)}...{account.slice(-4)}
            </p>
          )}
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Escrow List</h2>
          {escrows.length === 0 ? (
            <p style={styles.noEscrows}>No escrows found.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Buyer</th>
                  <th style={styles.th}>Seller</th>
                  <th style={styles.th}>Amount (Wei)</th>
                  <th style={styles.th}>Delivered</th>
                </tr>
              </thead>
              <tbody>
                {escrows.map(({ id, buyer, seller, amount, isDelivered }, index) => (
                  <tr key={id} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                    <td style={styles.td}>{id}</td>
                    <td style={styles.td}>{buyer.slice(0, 6)}...{buyer.slice(-4)}</td>
                    <td style={styles.td}>{seller.slice(0, 6)}...{seller.slice(-4)}</td>
                    <td style={styles.td}>{amount}</td>
                    <td style={styles.td}>{isDelivered ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Confirm Delivery</h2>
          <div style={styles.form}>
            <label style={styles.label}>
              Select Escrow ID:
              <select
                value={escrowIdToConfirm}
                onChange={(e) => setEscrowIdToConfirm(e.target.value)}
                disabled={loading || escrows.length === 0}
                style={styles.select}
              >
                <option value="">-- Select Escrow ID --</option>
                {escrows
                  .filter((escrow) => !escrow.isDelivered)
                  .map((escrow) => (
                    <option key={escrow.id} value={escrow.id}>
                      {escrow.id}
                    </option>
                  ))}
              </select>
            </label>
            <button
              onClick={handleConfirmDelivery}
              disabled={loading || !account || escrowIdToConfirm === ""}
              style={styles.confirmButton}
            >
              {loading ? "Processing..." : "Confirm Delivery"}
            </button>
          </div>
        </div>
      </main>

      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
}

// Styles
const styles = {
  container: {
    maxWidth: "800px",
    margin: "auto",
    padding: "1rem",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#f4f7fa",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: "600",
    color: "#333",
  },
  walletStatus: {
    display: "flex",
    alignItems: "center",
  },
  connectButton: {
    backgroundColor: "#007bff",
    color: "#fff",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
    transition: "background-color 0.3s",
  },
  connectedAccount: {
    fontSize: "0.9rem",
    color: "#555",
  },
  main: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    padding: "1.5rem",
  },
  cardTitle: {
    fontSize: "1.4rem",
    fontWeight: "500",
    color: "#333",
    marginBottom: "1rem",
  },
  noEscrows: {
    fontSize: "1rem",
    color: "#777",
    textAlign: "center",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    backgroundColor: "#f1f1f1",
    padding: "0.75rem",
    textAlign: "left",
    fontWeight: "600",
    color: "#333",
  },
  td: {
    padding: "0.75rem",
    borderBottom: "1px solid #eee",
  },
  evenRow: {
    backgroundColor: "#f9f9f9",
  },
  oddRow: {
    backgroundColor: "#fff",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  label: {
    fontSize: "1rem",
    color: "#333",
  },
  select: {
    width: "100%",
    padding: "0.5rem",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    marginTop: "0.5rem",
  },
  confirmButton: {
    backgroundColor: "#28a745",
    color: "#fff",
    padding: "0.75rem",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
    transition: "background-color 0.3s",
  },
  message: {
    marginTop: "1rem",
    padding: "1rem",
    backgroundColor: "#e9f7ef",
    color: "#155724",
    borderRadius: "4px",
    textAlign: "center",
  },
};