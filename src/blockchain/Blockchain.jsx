// React Code for Blockchain Frontend with TailwindCSS and React Router

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import axios from "axios";
import {
  FaSpinner,
  FaLink,
  FaArrowRight,
  FaEdit,
  FaTrash,
  FaArrowDown,
} from "react-icons/fa";
import { AiOutlineBlock } from "react-icons/ai";
import Modal from "react-modal";

Modal.setAppElement("#root");

function BlockchainApp() {
  const SERVER = import.meta.env.VITE_SERVER_URL;
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    _id: "",
    sender: "",
    recipient: "",
    product: "",
    quantity: "",
    location: "",
    status: "",
    temperature: "",
    deliveryDate: "",
  });
  const [triggerConditions, setTriggerConditions] = useState(() => {
    const savedConditions = localStorage.getItem("triggerConditions");
    return savedConditions
      ? JSON.parse(savedConditions)
      : {
          quantity: "",
          temperature: "",
          deliveryDate: "",
        };
  });
  const [blockchain, setBlockchain] = useState([]);
  const [message, setMessage] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch the blockchain and pending transactions on component mount
  useEffect(() => {
    getBlockchain();
    getPendingTransactions();
  }, []);

  // Function to get the entire blockchain
  const getBlockchain = async () => {
    try {
      const response = await axios.get(`${SERVER}/api/chain`);
      setBlockchain(response.data.chain);
    } catch (error) {
      console.error(error.response.data);
    }
  };

  // Function to get the pending transactions
  const getPendingTransactions = async () => {
    try {
      const response = await axios.get(`${SERVER}/api/pending-transactions`);
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error(error.response.data);
    }
  };

  // Function to handle changes in transaction form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction({ ...newTransaction, [name]: value });
  };

  // Function to handle changes in trigger conditions input
  const handleTriggerConditionsChange = (e) => {
    const { name, value } = e.target;
    setTriggerConditions({ ...triggerConditions, [name]: value });
  };

  // Function to save trigger conditions to local storage
  const saveTriggerConditions = () => {
    if (
      triggerConditions.quantity &&
      triggerConditions.temperature &&
      triggerConditions.deliveryDate
    ) {
      localStorage.setItem(
        "triggerConditions",
        JSON.stringify(triggerConditions)
      );
      setMessage("Trigger conditions saved successfully.");
      window.alert("New Trigger Condition Saved");
    } else {
      window.alert("All fields in the trigger condition form are required.");
    }
  };

  // Function to create or edit a transaction
  const saveTransaction = async () => {
    if (newTransaction._id) {
      // Edit existing transaction
      try {
        await axios.put(
          `${SERVER}/api/transactions/${newTransaction._id}`,
          newTransaction
        );
        setMessage("Transaction updated successfully.");
        closeModal();
        getPendingTransactions();
      } catch (error) {
        console.error(error.response.data);
      }
    } else {
      // Create new transaction
      try {
        const response = await axios.post(
          `${SERVER}/api/transactions/new`,
          newTransaction
        );
        window.alert("New Transaction Created");
        setMessage(response.data.message);
        setNewTransaction({
          _id: "",
          sender: "",
          recipient: "",
          product: "",
          quantity: "",
          location: "",
          status: "",
          temperature: "",
          deliveryDate: "",
        });
        getPendingTransactions();
      } catch (error) {
        console.error(error.response.data);
      }
    }
  };

  // Function to mine a new block
  const mineBlock = async () => {
    try {
      const invalidTransactions = transactions.filter(
        (tx) => !evaluateConditions(tx)
      );
      if (invalidTransactions.length > 0) {
        window.alert(
          "Some transactions do not meet the trigger conditions. Please update or delete them before mining."
        );
        return;
      }
      const response = await axios.get(`${SERVER}/api/mine`);
      setMessage(response.data.message);
      getBlockchain(); // Refresh blockchain after mining
      getPendingTransactions();
      window.alert("All Pending Transaction Mined into new block");
    } catch (error) {
      console.error(error.response.data);
    }
  };

  // Function to clear the entire blockchain
  const clearBlockchain = async () => {
    try {
      window.alert("Clearing the blockchain...");
      const response = await axios.post(`${SERVER}/api/clear`);
      setMessage(response.data.message);
      getBlockchain(); // Refresh blockchain after clearing
      getPendingTransactions();
    } catch (error) {
      console.error(error.response.data);
    }
  };

  // Function to evaluate conditions based on the trigger conditions set by the admin
  const evaluateConditions = (transaction) => {
    const quantityCondition = triggerConditions.quantity
      ? parseInt(transaction.quantity, 10) >=
        parseInt(triggerConditions.quantity, 10)
      : true;
    const temperatureCondition = triggerConditions.temperature
      ? parseInt(transaction.temperature, 10) <=
        parseInt(triggerConditions.temperature, 10)
      : true;
    const deliveryDateCondition = triggerConditions.deliveryDate
      ? new Date(transaction.deliveryDate) <=
        new Date(triggerConditions.deliveryDate)
      : true;
    return quantityCondition && temperatureCondition && deliveryDateCondition;
  };

  // Function to delete a pending transaction
  const deleteTransaction = async (id) => {
    try {
      await axios.delete(`${SERVER}/api/transactions/${id}`);
      setMessage("Transaction deleted successfully.");
      getPendingTransactions();
    } catch (error) {
      console.error(error.response.data);
    }
  };

  // Function to edit a pending transaction
  const editTransaction = (transaction) => {
    setNewTransaction({ ...transaction });
    setIsEditModalOpen(true);
  };

  // Function to close the edit modal
  const closeModal = () => {
    setIsEditModalOpen(false);
    setNewTransaction({
      _id: "",
      sender: "",
      recipient: "",
      product: "",
      quantity: "",
      location: "",
      status: "",
      temperature: "",
      deliveryDate: "",
    });
  };

  // Function to evaluate if a transaction meets the trigger conditions
  const doesTransactionMeetConditions = (transaction) => {
    return (
      parseInt(transaction.quantity) >= parseInt(triggerConditions.quantity) &&
      parseInt(transaction.temperature) <=
        parseInt(triggerConditions.temperature) &&
      new Date(transaction.deliveryDate) <=
        new Date(triggerConditions.deliveryDate)
    );
  };

  return (
    <Router>
      <div className="blockchain-app bg-gradient-to-br from-gray-100 to-gray-300 min-h-screen p-10">
        <h1 className="text-5xl font-extrabold text-center mb-10 text-blue-700">
          Smart Contract in Food Supply Chain using Blockchain
        </h1>
        <nav className="flex justify-center space-x-6 mb-10">
          <Link
            to="/"
            className="text-2xl font-semibold text-blue-600 hover:text-blue-800 transition"
          >
            Create Transaction
          </Link>
          <Link
            to="/blockchain"
            className="text-2xl font-semibold text-blue-600 hover:text-blue-800 transition"
          >
            View Blockchain
          </Link>
          <Link
            to="/pending-transactions"
            className="text-2xl font-semibold text-blue-600 hover:text-blue-800 transition"
          >
            Pending Transactions
          </Link>
        </nav>
        <Routes>
          <Route
            path="/"
            element={
              <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow-lg rounded-2xl p-8 mb-8">
                  <h2 className="text-3xl font-bold mb-6 text-gray-800">
                    Create a New Transaction
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input
                      name="sender"
                      value={newTransaction.sender}
                      onChange={handleInputChange}
                      placeholder="Sender"
                      className="p-4 border rounded-lg focus:ring-2 focus:ring-blue-300"
                    />
                    <input
                      name="recipient"
                      value={newTransaction.recipient}
                      onChange={handleInputChange}
                      placeholder="Recipient"
                      className="p-4 border rounded-lg focus:ring-2 focus:ring-blue-300"
                    />
                    <input
                      name="product"
                      value={newTransaction.product}
                      onChange={handleInputChange}
                      placeholder="Product"
                      className="p-4 border rounded-lg focus:ring-2 focus:ring-blue-300"
                    />
                    <input
                      name="quantity"
                      value={newTransaction.quantity}
                      onChange={handleInputChange}
                      placeholder="Quantity"
                      className="p-4 border rounded-lg focus:ring-2 focus:ring-blue-300"
                    />
                    <input
                      name="location"
                      value={newTransaction.location}
                      onChange={handleInputChange}
                      placeholder="Location"
                      className="p-4 border rounded-lg focus:ring-2 focus:ring-blue-300"
                    />
                    <select
                      name="status"
                      value={newTransaction.status}
                      onChange={handleInputChange}
                      className="p-4 border rounded-lg focus:ring-2 focus:ring-blue-300"
                    >
                      <option value="">Select Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <input
                      name="temperature"
                      value={newTransaction.temperature}
                      onChange={handleInputChange}
                      placeholder="Temperature"
                      className="p-4 border rounded-lg focus:ring-2 focus:ring-blue-300"
                    />
                    <input
                      type="date"
                      name="deliveryDate"
                      value={newTransaction.deliveryDate}
                      onChange={handleInputChange}
                      className="p-4 border rounded-lg focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                  <button
                    onClick={saveTransaction}
                    className="mt-8 w-full bg-blue-600 text-white p-4 rounded-lg font-bold hover:bg-blue-700 transition"
                  >
                    Save Transaction
                  </button>
                </div>

                {/* Trigger Conditions Form */}
                <div className="bg-white shadow-lg rounded-2xl p-8 mb-8">
                  <h2 className="text-3xl font-bold mb-6 text-gray-800">
                    Set Trigger Conditions
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input
                      type="number"
                      name="quantity"
                      value={triggerConditions.quantity}
                      onChange={handleTriggerConditionsChange}
                      placeholder="Quantity >= X"
                      className="p-4 border rounded-lg focus:ring-2 focus:ring-blue-300"
                      required
                    />
                    <input
                      type="number"
                      name="temperature"
                      value={triggerConditions.temperature}
                      onChange={handleTriggerConditionsChange}
                      placeholder="Temperature <= Y"
                      className="p-4 border rounded-lg focus:ring-2 focus:ring-blue-300"
                      required
                    />
                    <input
                      type="date"
                      name="deliveryDate"
                      value={triggerConditions.deliveryDate}
                      onChange={handleTriggerConditionsChange}
                      className="p-4 border rounded-lg focus:ring-2 focus:ring-blue-300"
                      required
                    />
                  </div>
                  <button
                    onClick={saveTriggerConditions}
                    className="mt-8 w-full bg-green-600 text-white p-4 rounded-lg font-bold hover:bg-green-700 transition"
                  >
                    Save Trigger Conditions
                  </button>
                </div>

                <div className="bg-white shadow-lg rounded-2xl p-8 mb-8">
                  <h2 className="text-3xl font-bold mb-6 text-gray-800">
                    Mine a New Block
                  </h2>
                  <p className="text-lg mb-4 text-gray-700">
                    There are currently <strong>{transactions.length}</strong>{" "}
                    pending transactions waiting to be mined.
                  </p>
                  <button
                    onClick={mineBlock}
                    className="w-full bg-green-600 text-white p-4 rounded-lg font-bold hover:bg-green-700 transition"
                  >
                    Mine Block
                  </button>
                </div>

                <div className="bg-white shadow-lg rounded-2xl p-8 mb-8">
                  <h2 className="text-3xl font-bold mb-6 text-gray-800">
                    Clear Blockchain
                  </h2>
                  <button
                    onClick={clearBlockchain}
                    className="w-full bg-red-600 text-white p-4 rounded-lg font-bold hover:bg-red-700 transition"
                  >
                    Clear Blockchain
                  </button>
                </div>
              </div>
            }
          />
          <Route
            path="/blockchain"
            element={
              <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl font-bold mb-10 text-gray-800">
                  Blockchain
                </h2>
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                  {blockchain.map((block, index) => (
                    <div key={index} className="blockchain-block mb-10">
                      <div className="flex items-center">
                        <AiOutlineBlock className="text-4xl text-blue-700 mr-4" />
                        <div className="p-6 rounded-lg bg-gradient-to-r from-blue-100 to-blue-300 w-full">
                          <p className="text-lg font-semibold text-gray-800">
                            Block #{block.index}
                          </p>
                          <p className="text-sm text-gray-600">
                            Timestamp:{" "}
                            {new Date(block.timestamp).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Previous Hash: {block.previous_hash}
                          </p>
                          <p className="text-sm text-gray-600">
                            Proof: {block.proof}
                          </p>
                          <div className="mt-4">
                            <h3 className="text-lg font-bold text-gray-800">
                              Transactions:
                            </h3>
                            {block.transactions.map((tx, txIndex) => (
                              <div
                                key={txIndex}
                                className="p-4 mt-2 bg-white border rounded-lg shadow-sm"
                              >
                                <p className="text-sm text-gray-600">
                                  Sender: {tx.sender}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Recipient: {tx.recipient}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Product: {tx.product}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Quantity: {tx.quantity}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Location: {tx.location}
                                </p>
                                <p
                                  className={`text-sm font-bold ${
                                    tx.status === "Completed"
                                      ? "text-green-600"
                                      : "text-yellow-600"
                                  }`}
                                >
                                  Status: {tx.status}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {index < blockchain.length - 1 && (
                        <div className="flex justify-center my-4">
                          <FaArrowDown className="text-3xl text-gray-500" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            }
          />
          <Route
            path="/pending-transactions"
            element={
              <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl font-bold mb-10 text-gray-800">
                  Pending Transactions
                </h2>
                {transactions.length > 0 ? (
                  <div className="bg-white p-8 rounded-2xl shadow-lg">
                    {transactions.map((transaction, index) => (
                      <div
                        key={index}
                        className="p-6 mb-6 bg-gradient-to-r from-yellow-100 to-yellow-300 rounded-lg shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">
                              Sender: {transaction.sender}
                            </p>
                            <p className="text-sm text-gray-600">
                              Recipient: {transaction.recipient}
                            </p>
                            <p className="text-sm text-gray-600">
                              Product: {transaction.product}
                            </p>
                            <p className="text-sm text-gray-600">
                              Quantity: {transaction.quantity}
                            </p>
                            <p className="text-sm text-gray-600">
                              Location: {transaction.location}
                            </p>
                            <p className="text-sm text-gray-600">
                              Temperature: {transaction.temperature}
                            </p>
                            <p className="text-sm text-gray-600">
                              Delivery Date:{" "}
                              {new Date(
                                transaction.deliveryDate
                              ).toLocaleDateString()}
                            </p>
                            <p
                              className={`text-sm font-bold ${
                                transaction.status === "Completed"
                                  ? "text-green-600"
                                  : "text-yellow-600"
                              }`}
                            >
                              Status: {transaction.status}
                            </p>
                            {!doesTransactionMeetConditions(transaction) && (
                              <p className="text-sm text-red-600 font-bold">
                                This transaction does not meet the trigger
                                conditions.
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => editTransaction(transaction)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => deleteTransaction(transaction._id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <p className="text-lg text-center font-bold text-gray-800">
                      No Pending Trasactions
                    </p>
                  </div>
                )}
              </div>
            }
          />
        </Routes>
        <Modal
          isOpen={isEditModalOpen}
          onRequestClose={closeModal}
          contentLabel="Edit Transaction"
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50"
        >
          <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              Edit Transaction
            </h2>
            <div className="grid grid-cols-1 gap-6">
              <input
                name="sender"
                value={newTransaction.sender}
                onChange={handleInputChange}
                placeholder="Sender"
                className="p-4 border rounded-lg focus:ring-2 focus:ring-blue-300"
              />
              <input
                name="recipient"
                value={newTransaction.recipient}
                onChange={handleInputChange}
                placeholder="Recipient"
                className="p-4 border rounded-lg focus:ring-2 focus:ring-blue-300"
              />
              <input
                name="product"
                value={newTransaction.product}
                onChange={handleInputChange}
                placeholder="Product"
                className="p-4 border rounded-lg focus:ring-2 focus:ring-blue-300"
              />
              <input
                name="quantity"
                value={newTransaction.quantity}
                onChange={handleInputChange}
                placeholder="Quantity"
                className="p-4 border rounded-lg focus:ring-2 focus:ring-blue-300"
              />
              <input
                name="location"
                value={newTransaction.location}
                onChange={handleInputChange}
                placeholder="Location"
                className="p-4 border rounded-lg focus:ring-2 focus:ring-blue-300"
              />
              <select
                name="status"
                value={newTransaction.status}
                onChange={handleInputChange}
                className="p-4 border rounded-lg focus:ring-2 focus:ring-blue-300"
              >
                <option value="">Select Status</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
              </select>
              <input
                name="temperature"
                value={newTransaction.temperature}
                onChange={handleInputChange}
                placeholder="Temperature"
                className="p-4 border rounded-lg focus:ring-2 focus:ring-blue-300"
              />
              <input
                type="date"
                name="deliveryDate"
                value={newTransaction.deliveryDate}
                onChange={handleInputChange}
                className="p-4 border rounded-lg focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <button
              onClick={saveTransaction}
              className="mt-8 w-full bg-blue-600 text-white p-4 rounded-lg font-bold hover:bg-blue-700 transition"
            >
              Save Changes
            </button>
          </div>
        </Modal>
      </div>
    </Router>
  );
}

export default BlockchainApp;
