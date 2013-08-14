SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';

ALTER TABLE `dcase` DROP FOREIGN KEY `fk_dcase_user1` ;

ALTER TABLE `dcase` ADD COLUMN `project_id` INT(11) AFTER `id` , 
  ADD CONSTRAINT `fk_dcase_project1`
  FOREIGN KEY (`project_id` )
  REFERENCES `project` (`id` )
  ON DELETE NO ACTION
  ON UPDATE NO ACTION
, ADD INDEX `fk_dcase_project1` (`project_id` ASC) ;

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

CREATE  TABLE IF NOT EXISTS `project` (
  `id` INT(11) NOT NULL AUTO_INCREMENT ,
  `name` VARCHAR(1024) NOT NULL ,
  `public_flag` TINYINT(1) NOT NULL DEFAULT FALSE ,
  `created` DATETIME NULL DEFAULT NULL ,
  `modified` TIMESTAMP NULL DEFAULT NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;

CREATE  TABLE IF NOT EXISTS `project_has_user` (
  `id` INT(11) NOT NULL AUTO_INCREMENT ,
  `project_id` INT(11) NOT NULL ,
  `user_id` INT(11) NOT NULL ,
  `created` DATETIME NULL DEFAULT NULL ,
  `modified` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_project_has_user_project1` (`project_id` ASC) ,
  INDEX `fk_project_has_user_user1` (`user_id` ASC) ,
  CONSTRAINT `fk_project_has_user_project1`
    FOREIGN KEY (`project_id` )
    REFERENCES `project` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_project_has_user_user1`
    FOREIGN KEY (`user_id` )
    REFERENCES `user` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
