<?php
// vehicles.php - API endpoint for managing vehicles

// Enable CORS and set content type
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle OPTIONS request for CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection
require_once 'config.php';

// GET request - Retrieve vehicles
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Check if vehicle ID is provided
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
        
        // Prepare SQL query to get a specific vehicle
        $sql = "SELECT * FROM vehicles WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$id]);
        
        if ($stmt->rowCount() > 0) {
            $vehicle = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($vehicle);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Vehicle not found"]);
        }
    } 
    // Check if customer ID is provided
    else if (isset($_GET['customerId'])) {
        $customerId = $_GET['customerId'];
        
        // Prepare SQL query to get vehicles for a specific customer
        $sql = "SELECT * FROM vehicles WHERE customer_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$customerId]);
        
        $vehicles = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($vehicles);
    }
    // Return all vehicles if no specific ID provided
    else {
        // Prepare SQL query to get all vehicles
        $sql = "SELECT * FROM vehicles";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        
        $vehicles = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($vehicles);
    }
}

// POST request - Create a new vehicle
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get request body
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    if (!isset($data['customer_id'])) {
        http_response_code(400);
        echo json_encode(["error" => "Customer ID is required"]);
        exit();
    }
    
    try {
        // Prepare SQL insert statement
        $sql = "INSERT INTO vehicles (
                customer_id, make, model, year, vin, 
                plate, state, engine, transmission, body_type, trim
            ) VALUES (
                ?, ?, ?, ?, ?, 
                ?, ?, ?, ?, ?, ?
            )";
        $stmt = $conn->prepare($sql);
        
        // Extract data from request
        $customerId = $data['customer_id'];
        $make = isset($data['make']) ? $data['make'] : '';
        $model = isset($data['model']) ? $data['model'] : '';
        $year = isset($data['year']) ? $data['year'] : '';
        $vin = isset($data['vin']) ? $data['vin'] : '';
        $plate = isset($data['plate']) ? $data['plate'] : '';
        $state = isset($data['state']) ? $data['state'] : '';
        $engine = isset($data['engine']) ? $data['engine'] : '';
        $transmission = isset($data['transmission']) ? $data['transmission'] : '';
        $bodyType = isset($data['body_type']) ? $data['body_type'] : '';
        $trim = isset($data['trim']) ? $data['trim'] : '';
        
        // Execute query
        $result = $stmt->execute([
            $customerId, $make, $model, $year, $vin,
            $plate, $state, $engine, $transmission, $bodyType, $trim
        ]);
        
        if ($result) {
            $vehicleId = $conn->lastInsertId();
            
            // Get the created vehicle
            $getVehicleSql = "SELECT * FROM vehicles WHERE id = ?";
            $getVehicleStmt = $conn->prepare($getVehicleSql);
            $getVehicleStmt->execute([$vehicleId]);
            $vehicle = $getVehicleStmt->fetch(PDO::FETCH_ASSOC);
            
            // Return success response
            echo json_encode([
                "success" => true,
                "message" => "Vehicle created successfully",
                "vehicle" => $vehicle
            ]);
        } else {
            throw new Exception("Failed to create vehicle");
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "error" => "Database error: " . $e->getMessage(),
            "code" => $e->getCode()
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}

// PUT request - Update an existing vehicle
else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Get request body
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(["error" => "Vehicle ID is required"]);
        exit();
    }
    
    try {
        // Check if vehicle exists
        $checkSql = "SELECT id FROM vehicles WHERE id = ?";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->execute([$data['id']]);
        
        if ($checkStmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(["error" => "Vehicle not found"]);
            exit();
        }
        
        // Build update SQL based on provided fields
        $updateFields = [];
        $params = [];
        
        $fields = ['customer_id', 'make', 'model', 'year', 'vin', 'plate', 'state', 'engine', 'transmission', 'body_type', 'trim'];
        
        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $updateFields[] = "$field = ?";
                $params[] = $data[$field];
            }
        }
        
        // If no fields to update, return
        if (empty($updateFields)) {
            http_response_code(400);
            echo json_encode(["error" => "No fields to update"]);
            exit();
        }
        
        // Add ID parameter for WHERE clause
        $params[] = $data['id'];
        
        // Prepare SQL update statement
        $sql = "UPDATE vehicles SET " . implode(", ", $updateFields) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        
        // Execute query
        $result = $stmt->execute($params);
        
        if ($result) {
            // Get the updated vehicle
            $getVehicleSql = "SELECT * FROM vehicles WHERE id = ?";
            $getVehicleStmt = $conn->prepare($getVehicleSql);
            $getVehicleStmt->execute([$data['id']]);
            $vehicle = $getVehicleStmt->fetch(PDO::FETCH_ASSOC);
            
            // Return success response
            echo json_encode([
                "success" => true,
                "message" => "Vehicle updated successfully",
                "vehicle" => $vehicle
            ]);
        } else {
            throw new Exception("Failed to update vehicle");
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "error" => "Database error: " . $e->getMessage(),
            "code" => $e->getCode()
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}

// DELETE request - Remove a vehicle
else if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Check if vehicle ID is provided
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
        
        try {
            // Check if vehicle exists
            $checkSql = "SELECT id FROM vehicles WHERE id = ?";
            $checkStmt = $conn->prepare($checkSql);
            $checkStmt->execute([$id]);
            
            if ($checkStmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(["error" => "Vehicle not found"]);
                exit();
            }
            
            // Prepare SQL delete statement
            $sql = "DELETE FROM vehicles WHERE id = ?";
            $stmt = $conn->prepare($sql);
            
            // Execute query
            $result = $stmt->execute([$id]);
            
            if ($result) {
                // Return success response
                echo json_encode([
                    "success" => true,
                    "message" => "Vehicle deleted successfully"
                ]);
            } else {
                throw new Exception("Failed to delete vehicle");
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                "error" => "Database error: " . $e->getMessage(),
                "code" => $e->getCode()
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Vehicle ID is required"]);
    }
}

// Invalid request method
else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>