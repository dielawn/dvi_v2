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
require_once 'db_connect.php'; // Adjust if your connection file is named differently

// Get database connection
$conn = getConnection();

// GET request - Retrieve inspections
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Check if vehicle ID is provided
    if (isset($_GET['vehicleId'])) {
        $vehicleId = $_GET['vehicleId'];
        
        // Prepare SQL query to get inspections for a specific vehicle
        $sql = "SELECT * FROM inspections WHERE vehicle_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $vehicleId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        // Fetch all inspections
        $inspections = [];
        while ($row = $result->fetch_assoc()) {
            // Convert stored JSON items back to an array
            $row['items'] = json_decode($row['items'], true);
            $inspections[] = $row;
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
        $stmt->bind_param("s", $inspectionId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $inspection = $result->fetch_assoc();
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
        $result = $stmt->get_result();
        
        // Fetch all inspections
        $inspections = [];
        while ($row = $result->fetch_assoc()) {
            // Convert stored JSON items back to an array
            $row['items'] = json_decode($row['items'], true);
            $inspections[] = $row;
        }
        
        // Return inspections as JSON
        echo json_encode($inspections);
    }
}

// POST request - Create a new inspection
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get request body
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    if (!isset($data['id']) || !isset($data['vehicleId']) || !isset($data['technicianId']) || !isset($data['items'])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing required fields"]);
        exit();
    }
    
    // Extract data from request
    $id = $data['id'];
    $vehicleId = $data['vehicleId'];
    $technicianId = $data['technicianId'];
    $date = isset($data['date']) ? $data['date'] : date('Y-m-d H:i:s');
    $workOrder = isset($data['workOrder']) ? $data['workOrder'] : null;
    
    // Convert items array to JSON string for storage
    $items = json_encode($data['items']);
    
    // Prepare SQL insert statement
    $sql = "INSERT INTO inspections (id, vehicle_id, technician_id, date, work_order, items) 
            VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssss", $id, $vehicleId, $technicianId, $date, $workOrder, $items);
    
    // Execute query
    if ($stmt->execute()) {
        // Return success response
        echo json_encode([
            "success" => true,
            "message" => "Inspection created successfully",
            "id" => $id
        ]);
    } else {
        // Return error response
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to create inspection",
            "error" => $conn->error
        ]);
    }
}

// PUT request - Update an existing inspection
else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
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
    $checkStmt->bind_param("s", $id);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows === 0) {
        http_response_code(404);
        echo json_encode(["error" => "Inspection not found"]);
        exit();
    }
    
    // Build update SQL based on provided fields
    $updateFields = [];
    $types = "";
    $params = [];
    
    if (isset($data['technicianId'])) {
        $updateFields[] = "technician_id = ?";
        $types .= "s";
        $params[] = $data['technicianId'];
    }
    
    if (isset($data['workOrder'])) {
        $updateFields[] = "work_order = ?";
        $types .= "s";
        $params[] = $data['workOrder'];
    }
    
    if (isset($data['items'])) {
        $updateFields[] = "items = ?";
        $types .= "s";
        $params[] = json_encode($data['items']);
    }
    
    // If no fields to update, return
    if (empty($updateFields)) {
        http_response_code(400);
        echo json_encode(["error" => "No fields to update"]);
        exit();
    }
    
    // Add ID parameter for WHERE clause
    $types .= "s";
    $params[] = $id;
    
    // Prepare SQL update statement
    $sql = "UPDATE inspections SET " . implode(", ", $updateFields) . " WHERE id = ?";
    $stmt = $conn->prepare($sql);
    
    // Dynamically bind parameters
    $bindParams = array_merge([$stmt, $types], $params);
    call_user_func_array('mysqli_stmt_bind_param', $bindParams);
    
    // Execute query
    if ($stmt->execute()) {
        // Return success response
        echo json_encode([
            "success" => true,
            "message" => "Inspection updated successfully",
            "id" => $id
        ]);
    } else {
        // Return error response
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to update inspection",
            "error" => $conn->error
        ]);
    }
}

// DELETE request - Remove an inspection
else if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Check if inspection ID is provided
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
        
        // Prepare SQL delete statement
        $sql = "DELETE FROM inspections WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $id);
        
        // Execute query
        if ($stmt->execute()) {
            // Return success response
            echo json_encode([
                "success" => true,
                "message" => "Inspection deleted successfully"
            ]);
        } else {
            // Return error response
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Failed to delete inspection",
                "error" => $conn->error
            ]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Missing inspection ID"]);
    }
}

// Invalid request method
else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}

// Close database connection
$conn->close();
?>