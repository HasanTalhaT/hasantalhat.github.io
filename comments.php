<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'OPTIONS') {
    // Preflight request
    exit(0);
}

if ($method == 'GET') {
    // Yorumları al
    if (file_exists('comments.json')) {
        $comments = file_get_contents('comments.json');
        echo $comments;
    } else {
        echo json_encode([]);
    }
} elseif ($method == 'POST') {
    // Yeni yorum ekle
    $input = json_decode(file_get_contents('php://input'), true);
    if (file_exists('comments.json')) {
        $comments = json_decode(file_get_contents('comments.json'), true);
    } else {
        $comments = [];
    }
    $comments[] = $input; // array_merge yerine doğrudan ekleme
    file_put_contents('comments.json', json_encode($comments));
    echo json_encode($input);
}
?>