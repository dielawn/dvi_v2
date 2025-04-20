<?php
// api/customers.php
require_once 'config.php';

$request_method = $_SERVER['REQUEST_METHOD'];

switch($request_method) {
    case 'GET':
        if(isset($_GET['id'])) {
            // Get a specific customer
            $id = $_GET['id'];
            getCustomer($id);
        } else {
            // Get all customers
            getCustomers();
        }
        break;
    case 'POST':
        // Create a new customer
        $data = json_decode(file_get_contents('php://input'), true);
        createCustomer($data);
        break;
    default:
        header('HTTP/1.1 405 Method Not Allowed');
        break;
}

function getCustomers() {
    global $conn;
    
    $query = "SELECT * FROM customers ORDER BY name ASC";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $result = [];
    
    foreach($customers as $customer) {
        // Get vehicles for each customer
        $vehicleQuery = "SELECT * FROM vehicles WHERE customer_id = ?";
        $vehicleStmt = $conn->prepare($vehicleQuery);
        $vehicleStmt->execute([$customer['id']]);
        $vehicles = $vehicleStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $customer['vehicles'] = $vehicles;
        $result[] = $customer;
    }
    
    echo json_encode($result);
}

function getCustomer($id) {
    global $conn;
    
    $query = "SELECT * FROM customers WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->execute([$id]);
    
    if($stmt->rowCount() > 0) {
        $customer = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Get vehicles for this customer
        $vehicleQuery = "SELECT * FROM vehicles WHERE customer_id = ?";
        $vehicleStmt = $conn->prepare($vehicleQuery);
        $vehicleStmt->execute([$id]);
        $vehicles = $vehicleStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $customer['vehicles'] = $vehicles;
        
        echo json_encode($customer);
    } else {
        header('HTTP/1.1 404 Not Found');
        echo json_encode(['error' => 'Customer not found']);
    }
}

function createCustomer($data) {
    global $conn;
    
    if(!isset($data['name']) || empty($data['name'])) {
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(['error' => 'Customer name is required']);
        return;
    }
    
    try {
        $conn->beginTransaction();
        
        // Insert customer
        $query = "INSERT INTO customers (name) VALUES (?)";
        $stmt = $conn->prepare($query);
        $stmt->execute([$data['name']]);
        
        $customerId = $conn->lastInsertId();
        
        // Adjust the vehicle insert query
        if(isset($data['vehicles']) && is_array($data['vehicles'])) {
            foreach($data['vehicles'] as $vehicle) {
                $vehicleQuery = "INSERT INTO vehicles (
                    customer_id, make, model, year, vin, 
                    plate, state, engine
                ) VALUES (
                    ?, ?, ?, ?, ?, 
                    ?, ?, ?
                )";
                $vehicleStmt = $conn->prepare($vehicleQuery);
                $vehicleStmt->execute([
                    $customerId,
                    $vehicle['make'] ?? '',
                    $vehicle['model'] ?? '',
                    $vehicle['year'] ?? '',
                    $vehicle['vin'] ?? '',
                    $vehicle['plate'] ?? '',
                    $vehicle['state'] ?? '',
                    $vehicle['engine'] ?? ''
                ]);
            }
        }
        
        $conn->commit();
        
        // Return the created customer
        getCustomer($customerId);
        
    } catch(PDOException $e) {
        $conn->rollBack();
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['error' => 'Failed to create customer: ' . $e->getMessage()]);
    }
}
?>