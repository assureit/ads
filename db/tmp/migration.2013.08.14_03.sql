SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';

ALTER TABLE `dcase` DROP FOREIGN KEY `fk_dcase_project1` ;

ALTER TABLE `dcase` DROP COLUMN `user_id` , CHANGE COLUMN `project_id` `project_id` INT(11) NOT NULL  , 
  ADD CONSTRAINT `fk_dcase_project1`
  FOREIGN KEY (`project_id` )
  REFERENCES `project` (`id` )
  ON DELETE NO ACTION
  ON UPDATE NO ACTION
, DROP INDEX `fk_dcase_user1_idx` ;

ALTER TABLE `issue` 
ADD INDEX `fk_issue_dcase1_idx` (`dcase_id` ASC) 
, DROP INDEX `fk_issue_dcase1_idx` ;

ALTER TABLE `monitor_node` 
ADD INDEX `fk_monitor_node_dcase1_idx` (`dcase_id` ASC) 
, DROP INDEX `fk_monitor_node_dcase1_idx` ;

ALTER TABLE `tag` 
DROP INDEX `idx_tag1` 
, ADD INDEX `idx_tag1` (`label` ASC) ;

ALTER TABLE `dcase_tag_rel` 
ADD INDEX `fk_dcase_tag_rel_dcase1_idx` (`dcase_id` ASC) 
, ADD INDEX `fk_dcase_tag_rel_tag1_idx` (`tag_id` ASC) 
, DROP INDEX `fk_dcase_tag_rel_tag1_idx` 
, DROP INDEX `fk_dcase_tag_rel_dcase1_idx` ;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
