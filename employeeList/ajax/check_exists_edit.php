<?php
#region Require Database Connections
require_once '../../dbconn/dbconnectkdtph.php';
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
$userQ = "SELECT * FROM emp_prof WHERE fldUser =:empUser AND fldEmployeeNum <> :empNum";
$userStmt = $connkdt->prepare($userQ);
$userStmt->execute([":empUser" => $empUser, ":empNum" => $empNum]);
if ($userStmt->rowCount() > 0) {
    $output[] = 'Username';
}
$emailQ = "SELECT * FROM kdtlogin WHERE fldOutlook =:empEmail AND fldEmployeeNum <> :empNum";
$emailStmt = $connkdt->prepare($emailQ);
$emailStmt->execute([":empEmail" => $empEmail, ":empNum" => $empNum]);
if ($emailStmt->rowCount() > 0) {
    $output[] = 'Email';
}

#endregion

#region function

#endregion

echo json_encode($output);
