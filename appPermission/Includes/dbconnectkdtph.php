<?php 
$servername = "localhost";
$username = "root";
$password = "";
try {
  $connkdt = new PDO("mysql:host=localhost;dbname=kdtphdb", $username, $password);
  $gods=["464","465","487"];

  $itMembers=array();
  $itQ="SELECT fldEmployeeNum FROM emp_prof WHERE fldGroup='IT' AND fldActive=1";
  $itStmt=$connkdt->query($itQ);
  $itArr=$itStmt->fetchAll();
  foreach($itArr AS $its){
    array_push($itMembers,$its['fldEmployeeNum']);
  }
  $allAccess=array();
  $allAccess=array_merge($gods,$itMembers);
  
  if(isset($_COOKIE["userID"]))
  $userHash=$_COOKIE["userID"];
  else
  $userHash='';
} catch(PDOException $e) {
  echo "Connection failed: " . $e->getMessage();
}
?>

