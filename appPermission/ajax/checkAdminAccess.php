<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$empNum='';
if(!empty($_POST['empNum'])){
    $empNum=$_POST['empNum'];
}
$output=0;
#endregion

#region main
if(in_array($empNum,$allAccess)){
    $output=1;
}
#endregion

#region function

#endregion
//$.ajaxSetup({async: false});
echo $output;
?>