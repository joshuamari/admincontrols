<?php 
$servername = "localhost";
$username = "root";
$password = "";
try {
  $connqms = new PDO("mysql:host=localhost;dbname=qmsmaindb", $username, $password);
  
} catch(PDOException $e) {
  echo "Connection failed: " . $e->getMessage();
}
?>
