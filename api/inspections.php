<?php
// inspections.php - API endpoint for managing vehicle inspections

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

// POST request - Create a new inspection
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get request body
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Log the received data for debugging
    error_log('Received data: ' . print_r($data, true));
    
    // Validate required fields
    if (!isset($data['id']) || !isset($data['vehicleId']) || !isset($data['technicianId']) || !isset($data['items'])) {
        http_response_code(400);
        echo json_encode([
            "error" => "Missing required fields",
            "received" => $data,
            "required" => ["id", "vehicleId", "technicianId", "items"]
        ]);
        exit();
    }
    
    // Extract data from request
    $id = $data['id'];
    $vehicleId = $data['vehicleId'];
    $technicianId = $data['technicianId'];
    $date = isset($data['date']) ? $data['date'] : date('Y-m-d H:i:s');
    $workOrder = isset($data['workOrder']) ? $data['workOrder'] : null;
    
    // Log the extracted data
    error_log('Extracted data - ID: ' . $id . ', Vehicle ID: ' . $vehicleId . ', Technician ID: ' . $technicianId . ', Date: ' . $date);
    
    // Convert items array to JSON string for storage
    $items = json_encode($data['items']);
    
    // Check if your database table has these columns
    // inspections table should have: id, vehicle_id, technician_id, date, work_order, items
    // If they're named differently, adjust the query below
    
    try {
        // First, let's check if an inspection with this ID already exists
        $checkSql = "SELECT COUNT(*) FROM inspections WHERE id = ?";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->execute([$id]);
        $count = $checkStmt->fetchColumn();
        
        if ($count > 0) {
            // Update existing inspection
            $sql = "UPDATE inspections SET 
                    vehicle_id = ?, 
                    technician_id = ?, 
                    date = ?, 
                    work_order = ?, 
                    items = ? 
                    WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $result = $stmt->execute([$vehicleId, $technicianId, $date, $workOrder, $items, $id]);
            $message = "Inspection updated successfully";
        } else {
            // Insert new inspection
            $sql = "INSERT INTO inspections (id, vehicle_id, technician_id, date, work_order, items) 
                    VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $result = $stmt->execute([$id, $vehicleId, $technicianId, $date, $workOrder, $items]);
            $message = "Inspection created successfully";
        }
        
        if ($result) {
            // Return success response
            echo json_encode([
                "success" => true,
                "message" => $message,
                "id" => $id
            ]);
        } else {
            throw new Exception('Execute failed');
        }
    } catch (PDOException $e) {
        // Return detailed error response for debugging
        http_response_code(500);
        $errorInfo = $stmt ? $stmt->errorInfo() : null;
        echo json_encode([
            "success" => false,
            "message" => "Failed to save inspection",
            "error" => $e->getMessage(),
            "code" => $e->getCode(),
            "sql_error" => $errorInfo,
            "sql" => $sql ?? null,
            "params" => [$id, $vehicleId, $technicianId, $date, $workOrder, $items]
        ]);
        
        // Log the error
        error_log('Database error: ' . $e->getMessage());
        error_log('SQL: ' . ($sql ?? 'N/A'));
        error_log('Params: ' . print_r([$id, $vehicleId, $technicianId, $date, $workOrder, $items], true));
    } catch (Exception $e) {
        // Return generic error response
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to save inspection",
            "error" => $e->getMessage()
        ]);
        
        // Log the error
        error_log('Error: ' . $e->getMessage());
    }
    exit();
}

// GET request - Retrieve inspections
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Check if vehicle ID is provided
    if (isset($_GET['vehicleId'])) {
        $vehicleId = $_GET['vehicleId'];
        
        // Prepare SQL query to get inspections for a specific vehicle
        $sql = "SELECT * FROM inspections WHERE vehicle_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$vehicleId]);
        
        // Fetch all inspections
        $inspections = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Convert stored JSON items back to an array for each inspection
        foreach ($inspections as &$inspection) {
            $inspection['items'] = json_decode($inspection['items'], true);
        }
        
        // Return inspections as JSON
        echo json_encode($inspections);
    } 
    // Check if inspection ID is provided
    else if (isset($_GET['id'])) {
        $inspectionId = $_GET['id'];
        
        // Prepare SQL query to get a specific inspection
        $sql = "SELECT * FROM inspections WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$inspectionId]);
        
        if ($stmt->rowCount() > 0) {
            $inspection = $stmt->fetch(PDO::FETCH_ASSOC);
            // Convert stored JSON items back to an array
            $inspection['items'] = json_decode($inspection['items'], true);
            echo json_encode($inspection);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Inspection not found"]);
        }
    }
    // Return all inspections if no specific ID provided
    else {
        // Prepare SQL query to get all inspections
        $sql = "SELECT * FROM inspections ORDER BY date DESC";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        
        // Fetch all inspections
        $inspections = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Convert stored JSON items back to an array for each inspection
        foreach ($inspections as &$inspection) {
            $inspection['items'] = json_decode($inspection['items'], true);
        }
        
        // Return inspections as JSON
        echo json_encode($inspections);
    }
    exit();
}

// PUT request - Update an existing inspection
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Get request body
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing inspection ID"]);
        exit();
    }
    
    // Extract data from request
    $id = $data['id'];
    
    // Check if inspection exists
    $checkSql = "SELECT id FROM inspections WHERE id = ?";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->execute([$id]);
    
    if ($checkStmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(["error" => "Inspection not found"]);
        exit();
    }
    
    // Build update SQL based on provided fields
    $updateFields = [];
    $params = [];
    
    if (isset($data['technicianId'])) {
        $updateFields[] = "technician_id = ?";
        $params[] = $data['technicianId'];
    }
    
    if (isset($data['workOrder'])) {
        $updateFields[] = "work_order = ?";
        $params[] = $data['workOrder'];
    }
    
    if (isset($data['items'])) {
        $updateFields[] = "items = ?";
        $params[] = json_encode($data['items']);
    }
    
    // If no fields to update, return
    if (empty($updateFields)) {
        http_response_code(400);
        echo json_encode(["error" => "No fields to update"]);
        exit();
    }
    
    // Add ID parameter for WHERE clause
    $params[] = $id;
    
    // Prepare SQL update statement
    $sql = "UPDATE inspections SET " . implode(", ", $updateFields) . " WHERE id = ?";
    $stmt = $conn->prepare($sql);
    
    // Execute query
    if ($stmt->execute($params)) {
        // Return success response
        echo json_encode([
            "success" => true,
            "message" => "Inspection updated successfully",
            "id" => $id
        ]);
    } else {
        // Return error response
        http_response_code(500);
        $error = $stmt->errorInfo();
        echo json_encode([
            "success" => false,
            "message" => "Failed to update inspection",
            "error" => $error[2]
        ]);
    }
    exit();
}

// DELETE request - Remove an inspection
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Check if inspection ID is provided
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
        
        // Prepare SQL delete statement
        $sql = "DELETE FROM inspections WHERE id = ?";
        $stmt = $conn->prepare($sql);
        
        // Execute query
        if ($stmt->execute([$id])) {
            // Return success response
            echo json_encode([
                "success" => true,
                "message" => "Inspection deleted successfully"
            ]);
        } else {
            // Return error response
            http_response_code(500);
            $error = $stmt->errorInfo();
            echo json_encode([
                "success" => false,
                "message" => "Failed to delete inspection",
                "error" => $error[2]
            ]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Missing inspection ID"]);
    }
    exit();
}

// Invalid request method
http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);

// Connection is managed by the PDO object in config.php
?>