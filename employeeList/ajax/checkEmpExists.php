<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$empNum=NULL;
if(!empty($_POST['empnum'])){
    $empNum=$_POST['empnum'];
}
$empUser=NULL;
if(!empty($_POST['username'])){
    $empUser=$_POST['username'];
}
$empEmail=NULL;
if(!empty($_POST['email'])){
    $empEmail=$_POST['email']."/P/KHI";
}
$mode=0;
if(isset($_POST['mode'])){
    $mode=$_POST['mode'];
}
$modeStatement='';
if($mode==1){
    $modeStatement=" AND fldEmployeeNum<>'$empNum'";
}
$output='';
#endregion

#region main
$empq="SELECT * FROM emp_prof WHERE (fldEmployeeNum='$empNum' OR fldUser='$empUser') $modeStatement";
$empstmt=$connkdt->query($empq);
if($empstmt->rowCount()>0){
    while($rowemp=$empstmt->fetch()){
        if(strcasecmp($empNum,$rowemp['fldEmployeeNum'])=='0'){
            $output.='id';
        }
        
        if(strcasecmp($empUser,$rowemp['fldUser'])=='0'){
            $output.='user';
        }
        
    }
}
$emailq="SELECT * FROM kdtlogin WHERE fldLotus='$empEmail' $modeStatement";
$emailstmt=$connkdt->query($emailq);
if($emailstmt->rowCount()>0){
    while($rowemail=$emailstmt->fetch()){
        if(strcasecmp($empEmail,$rowemail['fldLotus'])=='0'){
            $output.='lotus';
        }
        
    }
}
#endregion

#region function

#endregion
//$.ajaxSetup({async: false});

echo $output;
?>