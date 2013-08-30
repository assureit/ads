SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';

ALTER TABLE `commit` ADD COLUMN `meta_data` TEXT NULL DEFAULT NULL  AFTER `message` , ADD COLUMN `role` VARCHAR(80) NULL DEFAULT NULL  AFTER `user_id` ;

ALTER TABLE `user` ADD COLUMN `mail_address` VARCHAR(256) NULL DEFAULT NULL  AFTER `login_name` ;

ALTER TABLE `project` ADD COLUMN `last_modified` DATETIME NULL DEFAULT NULL COMMENT 'プロジェクト内のDCaseが最終的に更新された日時'  AFTER `delete_flag` ;

ALTER TABLE `project_has_user` ADD COLUMN `role` VARCHAR(80) NULL DEFAULT NULL  AFTER `user_id` ;

CREATE  TABLE IF NOT EXISTS `access_log` (
  `id` INT(11) NOT NULL AUTO_INCREMENT ,
  `commit_id` INT(11) NOT NULL ,
  `user_id` INT(11) NOT NULL ,
  `access_type` VARCHAR(45) NULL DEFAULT NULL ,
  `accessed` DATETIME NULL DEFAULT NULL ,
  `created` DATETIME NULL DEFAULT NULL ,
  `modified` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_access_log_commit1` (`commit_id` ASC) ,
  INDEX `fk_access_log_user1` (`user_id` ASC) ,
  CONSTRAINT `fk_access_log_commit1`
    FOREIGN KEY (`commit_id` )
    REFERENCES `commit` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_access_log_user1`
    FOREIGN KEY (`user_id` )
    REFERENCES `user` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

insert into project_has_user (project_id, user_id, role) values (1, 1, 'system');

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
