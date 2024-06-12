<?php
$config = [
    'host' => 'localhost',
    'dbname' => 'kdtphdb_new',
    'charset' => 'utf8mb4'
];
$username = 'kdt';
$password = 'none';
$dsn = 'mysql:' . http_build_query($config, '', ';');
try {
    $connnew = new PDO($dsn, $username, $password, [
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    $conn_new_disable = new PDO($dsn, $username, $password, [

        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,

        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,

        PDO::ATTR_AUTOCOMMIT => false

    ]);
} catch (PDOException $e) {
    echo "Connection failed";
}
