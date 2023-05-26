<?php
date_default_timezone_set("Asia/Manila");

    $servername = "localhost";
    $username = "root";
    $password = "";

    try{
        $connforms = new PDO ("mysql:host=$servername;
        dbname=formsdb", $username, $password);
        $connforms->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
    catch(PDOException $e) {
        echo "Connection failed: ". $e->getMessage();
    }

?>