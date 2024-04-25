<?php
$config = [
    'host' => 'localhost',
    'port' => 3306,
    'dbname' => 'formsdb',
    'charset' => 'utf8mb4'
];
$username = 'root';
$password = '';
$dsn = 'mysql:' . http_build_query($config, '', ';');
try {
    $connforms = new PDO($dsn, $username, $password, [
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    $connDisableForms = new PDO($dsn, $username, $password, [

        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,

        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,

        PDO::ATTR_AUTOCOMMIT => false

    ]);
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
