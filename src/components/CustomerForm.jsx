import React from 'react';

const CustomerForm = ({ name, setName }) => {
  return (
    <div className="customer-form">
      <h2>Customer Information</h2>
      <div className="form-group">
        <label>Customer Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Enter customer name"
        />
      </div>
    </div>
  );
};

export default CustomerForm;