<?php
require_once 'dbconnectkdtph.php'; //database connection
$output=array();
if(!empty($userHash)){
    $loginQ="SELECT fldEmployeeNum FROM kdtlogin WHERE fldUserHash='$userHash'";
    $loginStmt=$connkdt->query($loginQ);
    if($loginStmt->rowCount()>0){
        $userLogin=$loginStmt->fetchColumn();
        $output+=["empNum"=>$userLogin];
        // $output=$userLogin;
    }
    $empDeetsQ="SELECT * FROM emp_prof WHERE fldEmployeeNum='$userLogin'";
    $empDeetsStmt=$connkdt->query($empDeetsQ);
    $empDeetsArr=$empDeetsStmt->fetchAll();
    foreach($empDeetsArr AS $empdeets){
        $output+=["empFName"=>$empdeets['fldFirstname']];
        $output+=["empSName"=>$empdeets['fldSurname']];
        $output+=["empNName"=>$empdeets['fldNick']];
        $output+=["empDateHired"=>$empdeets['fldDateHired']];
        $output+=["empGroup"=>$empdeets['fldGroup']];
        $output+=["empGender"=>$empdeets['fldGender']];
        // $output+=["empRole"=>NULL];
    }
    // $emppic="SELECT * FROM formspic WHERE fldEmployeeNum='$userLogin'";
    // $emppicStmt=$connkdt->query($emppic);
    // $emppicArr=$emppicStmt->fetchAll();
    // if(count($emppicArr)>0){
    //     foreach($emppicArr AS $emppics){
    //         $output["empRole"]=$emppics['fldRole'];
    //     }
    // }
    
}
echo json_encode($output);
?>