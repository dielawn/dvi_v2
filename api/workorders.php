<?php
require_once 'config.php';

$request_method = $_SERVER['REQUEST_METHOD'];

switch($request_method) {
    case 'GET':
        if(isset($_GET['id'])) {
            // Get a specific work order
            $id = $_GET['id'];
            getWorkOrder($id);
        } else {
            // Get all work orders
            getWorkOrders();
        }
        break;
    case 'POST':
        // Create a new work order
        $data = json_decode(file_get_contents('php://input'), true);
        createWorkOrder($data);
        break;
    default:
        header('HTTP/1.1 405 Method Not Allowed');
        break;
}

function getWorkOrders() {
    global $conn;
    
    $query = "SELECT wo.*, c.name as customer_name, 
              v.make, v.model, v.year, v.vin 
              FROM work_orders wo
              JOIN customers c ON wo.customer_id = c.id
              JOIN vehicles v ON wo.vehicle_id = v.id
              ORDER BY wo.created_at DESC";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $workOrders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($workOrders);
}

function getWorkOrder($id) {
    global $conn;
    
    $query = "SELECT wo.*, c.name as customer_name, 
              v.make, v.model, v.year, v.vin 
              FROM work_orders wo
              JOIN customers c ON wo.customer_id = c.id
              JOIN vehicles v ON wo.vehicle_id = v.id
              WHERE wo.id = ?";
    $stmt = $conn->prepare($query);
    $stmt->execute([$id]);
    
    if($stmt->rowCount() > 0) {
        $workOrder = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode($workOrder);
    } else {
        header('HTTP/1.1 404 Not Found');
        echo json_encode(['error' => 'Work order not found']);
    }
}

function createWorkOrder($data) {
    global $conn;
    
    if(!isset($data['workOrderNumber']) || 
       !isset($data['customerId']) || 
       !isset($data['vehicleId'])) {
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(['error' => 'Work order number, customer ID, and vehicle ID are required']);
        return;
    }
    
    try {
        $query = "INSERT INTO work_orders (work_order_number, customer_id, vehicle_id) 
                  VALUES (?, ?, ?)";
        $stmt = $conn->prepare($query);
        $stmt->execute([
            $data['workOrderNumber'],
            $data['customerId'],
            $data['vehicleId']
        ]);
        
        $workOrderId = $conn->lastInsertId();
        
        // Return the created work order
        getWorkOrder($workOrderId);
        
    } catch(PDOException $e) {
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['error' => 'Failed to create work order: ' . $e->getMessage()]);
    }
}
?>