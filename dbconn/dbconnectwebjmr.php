<?php
$envPath = dirname(__DIR__) . '/.env';

if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) continue;

        [$name, $value] = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
} else {
    die("Missing .env file at: $envPath");
}

$host = $_ENV['DB4_HOST'] ?? '';
$dbname = $_ENV['DB4_NAME'] ?? '';
$charset = $_ENV['DB4_CHARSET'] ?? '';
$username = $_ENV['DB4_USER'] ?? '';
$password = $_ENV['DB4_PASS'] ?? '';

$dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";

try {
    $connwebjmr = new PDO($dsn, $username, $password, [
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    $leaveQ = "SELECT fldID FROM `projectstable` WHERE fldProject='Leave'";
    $leaveStmt = $connwebjmr->query($leaveQ);
    $leaveID = (int)$leaveStmt->fetchColumn();

    $excludeGroups = ['SHI', 'INT', 'SYS', 'TEG', 'ADM', 'ACT', 'MNG', 'DXT', 'IT'];
} catch (PDOException $e) {
    echo "Connection failed3: " . $e->getMessage();
}
