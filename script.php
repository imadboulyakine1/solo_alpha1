<?php 
header('Content-Type: application/json');
$host = 'localhost';
$user_name = 'root';
$password = '';
$db_name = 'database';

$conn = mysqli_connect($host, $user_name, $password, $db_name);
if (!$conn) {
    die('{"error": "Database connection failed: ' . mysqli_connect_error() . '"}'); // Return JSON error
}


if ($_SERVER["REQUEST_METHOD"] == "GET") {
    // Fetch tasks
$sql = "SELECT CAST(id AS UNSIGNED) AS id, title, description, achieved FROM tasks";
    $result = mysqli_query($conn, $sql);
    if ($result) {
        $tasks = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $tasks[] = $row;
        }
        echo json_encode($tasks);
    } else {
        die('{"error": "SQL query failed: ' . mysqli_error($conn) . '"}');
    }
} elseif ($_SERVER["REQUEST_METHOD"] === "POST") {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!isset($input['action'])) {
        echo json_encode(['success' => false, 'message' => 'No action specified']);
        exit;
    }
    $action = $input['action'];
    $id = mysqli_real_escape_string($conn, $input['id'] ?? '');

    if ($action === 'delete') {
        $sql = "DELETE FROM tasks WHERE id = $id";
        if (mysqli_query($conn, $sql)) {
            echo json_encode(['success' => true, 'message' => 'Task deleted successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error deleting task: ' . mysqli_error($conn)]);
        }
    } elseif ($action === 'edit') {
        $title = mysqli_real_escape_string($conn, $input['title'] ?? '');
        $description = mysqli_real_escape_string($conn, $input['description'] ?? '');
        $achieved = isset($input['achieved']) ? 1 : 0;

        $sql = "UPDATE tasks SET title = '$title', description = '$description', achieved = $achieved WHERE id = $id";
        if (mysqli_query($conn, $sql)) {
            echo json_encode(['success' => true, 'message' => 'Task updated successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error updating task: ' . mysqli_error($conn)]);
        }
    }
}


?>