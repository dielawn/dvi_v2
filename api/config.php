<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Keep host as localhost, but update the other credentials
$host = 'localhost';
$db_name = 'YOUR_DATABASE_NAME'; // The database name you created
$username = 'YOUR_DATABASE_USERNAME'; // The username from MySQL Database Wizard
$password = 'YOUR_DATABASE_PASSWORD'; // The password you set

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    die();
}
?>