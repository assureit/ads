SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';

ALTER TABLE `issue` 
DROP INDEX `fk_issue_dcase1` 
, ADD INDEX `fk_issue_dcase1_idx` (`dcase_id` ASC) ;

ALTER TABLE `monitor_node` 
DROP INDEX `fk_monitor_node_dcase1` 
, ADD INDEX `fk_monitor_node_dcase1_idx` (`dcase_id` ASC) ;

ALTER TABLE `tag` 
ADD INDEX `idx_tag1` (`label` ASC) ;

ALTER TABLE `dcase_tag_rel` 
DROP INDEX `fk_dcase_tag_rel_dcase1` 
, ADD INDEX `fk_dcase_tag_rel_dcase1_idx` (`dcase_id` ASC) 
, DROP INDEX `fk_dcase_tag_rel_tag1` 
, ADD INDEX `fk_dcase_tag_rel_tag1_idx` (`tag_id` ASC) 
, ADD UNIQUE INDEX `unq_dcase_tag_rel1` (`dcase_id` ASC, `tag_id` ASC) ;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
