-- Sync kdtpositions and Industrial kdtbu names from kdtphdb_new.
-- Same result as scripts/sync_kdt_catalogs.php. Safe to run again.

USE `kdtphdb`;

INSERT INTO `kdtpositions` (`id`, `fldAcro`, `fldFull`, `fldSection`, `fldSectionID`, `fldPrio`, `fldShowManSum`) VALUES
(1,'SSV','Senior Supervisor','Manager',1,11,1),
(2,'SV','Supervisor','Manager',1,8,1),
(3,'SDE','Senior Design Engineer','Engineering',2,2,1),
(4,'DE3','Design Engineer 3','Engineering',2,3,1),
(5,'DE2','Design Engineer 2','Engineering',2,5,1),
(6,'DE1','Design Engineer 1','Engineering',2,6,1),
(7,'ADE','Assistant Design Engineer','Engineering',2,7,1),
(8,'PDE','Probationary Design Engineer','Engineering',2,8,1),
(9,'CDE','Contractual Design Engineer','Engineering',2,0,0),
(10,'CSV','CAD Supervisor','Engineering',2,0,0),
(11,'CS','CAD Specialist','Engineering',2,0,0),
(12,'SCO','Senior CAD Operator','Engineering',2,0,0),
(13,'CO2','CAD Operator 2','Engineering',2,0,0),
(14,'CO1','CAD Operator 1','Engineering',2,0,0),
(15,'ACO','Assistant CAD Operator','Engineering',2,0,0),
(16,'IT-E1','IT Engineer 1','IT',3,7,1),
(17,'AM','Assistant Manager','Manager',1,5,1),
(18,'DM','Department Manager','Manager',1,4,1),
(19,'SM','Senior Manager','Manager',1,3,1),
(20,'PSE','Probationary Software Engineer','System',4,10,1),
(21,'SSS','Senior Software Supervisor','System',4,5,1),
(22,'SSE','Senior Software Engineer','System',4,7,1),
(23,'SE1','Software Engineer 1','System',4,9,1),
(24,'SE2','Software Engineer 2','System',4,8,1),
(25,'SE3','Software Engineer 3','System',4,8,1),
(26,'SDM','Software Developer Manager','System',4,2,1),
(27,'ASM','Asst. Software Manager','System',4,3,1),
(28,'JSS','Jr. Software Supervisor','System',4,6,1),
(29,'KDTP','KDT President','Manager',1,0,0),
(30,'IT-E2','IT Engineer 2','IT',3,6,1),
(31,'IT-E3','IT-Engineer 3','IT',3,5,1),
(34,'IT-SS','IT Support Staff','IT',3,8,1),
(36,'IT-SV','IT Supervisor','IT',3,2,1),
(37,'ASE','Assistant Software Engineer','System',4,9,1),
(40,'MJ','Messenger/Janitor','Admin',5,7,1),
(41,'ASS','Admin Staff/Secretary','Admin',5,5,1),
(42,'AAR','Admin Assistant/Receptionist','Admin',5,6,1),
(43,'DR2','Company Driver 2','Admin',5,8,1),
(44,'DR','Company Driver','Admin',5,8,1),
(45,'DRM','Company Driver/Messenger','Admin',5,10,1),
(46,'SA','Senior Accountant','Admin',5,9,1),
(47,'SAA','Senior Accounting Assistant','Admin',5,11,1),
(48,'AA','Accounting Assistant','Admin',5,13,1),
(49,'CSAD','Contractual Senior Advisor','Admin',5,2,1),
(50,'KDTP','President','Manager',1,0,0),
(51,'CTE','Contractual Technical Expert','Manager',1,12,1),
(52,'IT-SE','IT Senior Engineer','IT',3,3,1),
(53,'CSE','Contractual Supervising Engineer','Engineering',2,8,1),
(54,'PIT-SS','Probationary IT Support Staff','IT',3,8,1),
(55,'GM','General Manager','Manager',1,1,1),
(56,'BK','Book Keeper','Admin',5,16,1),
(57,'SBK','Senior Book Keeper','Admin',5,15,1),
(58,'JA','Junior Accountant','Admin',5,14,1),
(59,'DR1','Company Driver 1','Admin',5,12,1),
(60,'SAAS','Senior Admin Asst/Secretary','Admin',5,3,1),
(61,'SAAR','Senior Admin Assistant/Receptionist','Admin',5,4,1),
(62,'M','Manager','Manager',1,6,1),
(63,'KDTVP','Vice President','Manager',1,0,0)
ON DUPLICATE KEY UPDATE
  `fldAcro` = VALUES(`fldAcro`),
  `fldFull` = VALUES(`fldFull`),
  `fldSection` = VALUES(`fldSection`),
  `fldSectionID` = VALUES(`fldSectionID`),
  `fldPrio` = VALUES(`fldPrio`),
  `fldShowManSum` = VALUES(`fldShowManSum`);

UPDATE `kdtbu`
SET `fldDepartment` = 'Industrial'
WHERE `fldBU` IN ('CEM','ETCL','MIL','MPM')
  AND (`fldDepartment` IS NULL OR `fldDepartment` <> 'Industrial');

ALTER TABLE `kdtpositions` AUTO_INCREMENT = 64;
