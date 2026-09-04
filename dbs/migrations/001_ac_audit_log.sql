-- Admin Controls activity log (kdtphdb).
-- One table for all pages. Filter by `entity` + `entity_id`.
-- `id` is the log row. `entity_id` is the record (employee, group, holiday, ...).

CREATE TABLE IF NOT EXISTS `ac_audit_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `actor` int(11) NOT NULL,
  `action` varchar(32) NOT NULL,
  `entity` varchar(32) NOT NULL,
  `entity_id` int(11) NOT NULL,
  `old_json` longtext DEFAULT NULL,
  `new_json` longtext DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_ac_audit_entity` (`entity`,`entity_id`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
