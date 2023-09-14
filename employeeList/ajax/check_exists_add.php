<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$empNum = NULL;
if (!empty($_POST['empnum'])) {
    $empNum = $_POST['empnum'];
}
$empUser = NULL;
if (!empty($_POST['username'])) {
    $empUser = $_POST['username'];
}
$empEmail = NULL;
if (!empty($_POST['email'])) {
    $empEmail = $_POST['email'] . "@global.kawasaki.com";
}
$output = array();
#endregion

#region main
$empQ = "SELECT * FROM emp_prof WHERE fldEmployeeNum =:empNum";
$empStmt = $connkdt->prepare($empQ);
$empStmt->execute([":empNum" => $empNum]);
if ($empStmt->rowCount() > 0) {
    $output[] = 'Employee Number';
}
$userQ = "SELECT * FROM emp_prof WHERE fldUser =:empUser";
$userStmt = $connkdt->prepare($userQ);
$userStmt->execute([":empUser" => $empUser]);
if ($userStmt->rowCount() > 0) {
    $output[] = 'Username';
}
$emailQ = "SELECT * FROM kdtlogin WHERE fldOutlook =:empEmail";
$emailStmt = $connkdt->prepare($emailQ);
$emailStmt->execute([":empEmail" => $empEmail]);
if ($emailStmt->rowCount() > 0) {
    $output[] = 'Email';
}

#endregion

#region function

#endregion

echo json_encode($output);
