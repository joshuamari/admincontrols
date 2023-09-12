<?php
$servername = "localhost";
$username = "root";
$password = "";
try {
  $connkdt = new PDO("mysql:host=localhost;dbname=kdtphdb", $username, $password);
  $gods = ["464", "487"];

  $sysMembers = array();
  $sysQ = "SELECT fldEmployeeNum FROM emp_prof WHERE fldGroup='SYS' AND fldActive=1";
  $sysStmt = $connkdt->query($sysQ);
  $sysArr = $sysStmt->fetchAll();
  foreach ($sysArr as $sys) {
    array_push($sysMembers, $sys['fldEmployeeNum']);
  }
  $allAccess = array();
  $allAccess = array_merge($gods, $sysMembers);
} catch (PDOException $e) {
  echo "Connection failed: " . $e->getMessage();
}
