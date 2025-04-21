CREATE TABLE inspections (
    id VARCHAR(36) PRIMARY KEY,
    vehicle_id INT,
    technician_id VARCHAR(10),
    date DATETIME,
    work_order VARCHAR(50),
    items TEXT
);

CREATE INDEX idx_vehicle_id ON inspections(vehicle_id);
CREATE INDEX idx_date ON inspections(date);

-- Customers table
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles table
CREATE TABLE vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year VARCHAR(4) NOT NULL,
    vin VARCHAR(17),
    plate VARCHAR(20),
    state VARCHAR(2),
    engine VARCHAR(100),
    transmission VARCHAR(50),
    body_type VARCHAR(50),
    trim VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Work orders table
CREATE TABLE work_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    work_order_number VARCHAR(20) NOT NULL,
    customer_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    inspection_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);



