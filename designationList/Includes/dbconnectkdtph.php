<?php
$config = [
  'host' => 'localhost',
  'port' => 3306,
  'dbname' => 'kdtphdb',
  'charset' => 'utf8mb4'
];
$username = 'root';
$password = '';
$dsn = 'mysql:' . http_build_query($config, '', ';');
try {
  $connkdt = new PDO($dsn, $username, $password, [
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
  ]);
  $connDisable = new PDO($dsn, $username, $password, [

    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,

    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,

    PDO::ATTR_AUTOCOMMIT => false

  ]);
  $sysItMembers = array();
  $sysItQ = "SELECT fldEmployeeNum FROM emp_prof WHERE fldGroup IN ('IT','SYS') AND fldActive=1";
  $sysItStmt = $connkdt->query($sysItQ);
  $sysItArr = $sysItStmt->fetchAll();
  foreach ($sysItArr as $sis) {
    array_push($sysItMembers, $sis['fldEmployeeNum']);
  }
} catch (PDOException $e) {
  echo "Connection failed: " . $e->getMessage();
}
