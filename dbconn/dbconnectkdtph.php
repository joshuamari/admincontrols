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

$host = $_ENV['DB1_HOST'] ?? '';
$dbname = $_ENV['DB1_NAME'] ?? '';
$charset = $_ENV['DB1_CHARSET'] ?? '';
$username = $_ENV['DB1_USER'] ?? '';
$password = $_ENV['DB1_PASS'] ?? '';

$dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";

try {
  $connkdt = new PDO($dsn, $username, $password, [
    PDO::ATTR_EMULATE_PREPARES => false,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
  ]);

  $connDisable = new PDO($dsn, $username, $password, [
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_AUTOCOMMIT => false
  ]);
} catch (PDOException $e) {
  echo "Connection failed1: " . $e->getMessage();
}
