SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';

DROP SCHEMA IF EXISTS `default_schema` ;

CREATE SCHEMA IF NOT EXISTS `ads` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;

USE `ads`;

CREATE  TABLE IF NOT EXISTS `ads`.`dcase` (
  `id` INT(11) NOT NULL AUTO_INCREMENT ,
  `name` VARCHAR(255) NULL DEFAULT NULL ,
  `delete_flag` TINYINT(1) NULL DEFAULT FALSE ,
  `user_id` INT(11) NOT NULL ,
  `created` DATETIME NULL DEFAULT NULL ,
  `modified` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_dcase_user1_idx` (`user_id` ASC) ,
  CONSTRAINT `fk_dcase_user1`
    FOREIGN KEY (`user_id` )
    REFERENCES `ads`.`user` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

CREATE  TABLE IF NOT EXISTS `ads`.`commit` (
  `id` INT(11) NOT NULL AUTO_INCREMENT ,
  `data` TEXT NULL DEFAULT NULL COMMENT 'D-Case のオブジェクトツリー（JSON）' ,
  `date_time` DATETIME NULL DEFAULT NULL COMMENT 'コミット日時' ,
  `prev_commit_id` INT(11) NULL DEFAULT NULL COMMENT '前回コミットID' ,
  `latest_flag` TINYINT(1) NULL DEFAULT TRUE COMMENT '最新コミットフラグ 0:最新でない 1:最新' ,
  `message` TEXT NULL DEFAULT NULL COMMENT 'コミットメッセージ' ,
  `dcase_id` INT(11) NOT NULL ,
  `user_id` INT(11) NOT NULL ,
  `created` DATETIME NULL DEFAULT NULL ,
  `modified` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_commit_dcase1_idx` (`dcase_id` ASC) ,
  INDEX `fk_commit_user1_idx` (`user_id` ASC) ,
  CONSTRAINT `fk_commit_dcase1`
    FOREIGN KEY (`dcase_id` )
    REFERENCES `ads`.`dcase` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_commit_user1`
    FOREIGN KEY (`user_id` )
    REFERENCES `ads`.`user` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

CREATE  TABLE IF NOT EXISTS `ads`.`user` (
  `id` INT(11) NOT NULL AUTO_INCREMENT ,
  `login_name` VARCHAR(45) NOT NULL ,
  `delete_flag` TINYINT(1) NOT NULL DEFAULT FALSE ,
  `system_flag` TINYINT(1) NOT NULL DEFAULT FALSE ,
  `created` DATETIME NULL DEFAULT NULL ,
  `modified` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP ,
  PRIMARY KEY (`id`) ,
  UNIQUE INDEX `unq_user1` (`login_name` ASC) )
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

CREATE  TABLE IF NOT EXISTS `ads`.`node` (
  `id` INT(11) NOT NULL AUTO_INCREMENT ,
  `this_node_id` INT(11) NULL DEFAULT NULL COMMENT 'D-CaseにおけるノードID' ,
  `description` TEXT NULL DEFAULT NULL COMMENT 'ノード説明' ,
  `node_type` VARCHAR(45) NULL DEFAULT NULL COMMENT 'ノードタイプ（Goal等）' ,
  `commit_id` INT(11) NOT NULL ,
  `created` DATETIME NULL DEFAULT NULL ,
  `modified` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_node_commit1_idx` (`commit_id` ASC) ,
  CONSTRAINT `fk_node_commit1`
    FOREIGN KEY (`commit_id` )
    REFERENCES `ads`.`commit` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

CREATE  TABLE IF NOT EXISTS `ads`.`file` (
  `id` INT(11) NOT NULL AUTO_INCREMENT ,
  `name` VARCHAR(512) NOT NULL COMMENT '実ファイル名' ,
  `path` VARCHAR(1024) NOT NULL COMMENT 'ADS内におけるファイルのパス名（実ファイル名は変換）' ,
  `user_id` INT(11) NOT NULL ,
  `created` DATETIME NULL DEFAULT NULL COMMENT '作成日時' ,
  `modified` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時' ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_file_user1_idx` (`user_id` ASC) ,
  CONSTRAINT `fk_file_user1`
    FOREIGN KEY (`user_id` )
    REFERENCES `ads`.`user` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

CREATE  TABLE IF NOT EXISTS `ads`.`node_property` (
  `id` INT(11) NOT NULL AUTO_INCREMENT ,
  `name` VARCHAR(32) NOT NULL COMMENT 'プロパティ名' ,
  `value` VARCHAR(128) NOT NULL COMMENT 'プロパティ値' ,
  `node_id` INT(11) NOT NULL COMMENT '紐付くノードのノードID' ,
  `created` DATETIME NULL DEFAULT NULL ,
  `modified` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_node_property_node1_idx` (`node_id` ASC) ,
  CONSTRAINT `fk_node_property_node1`
    FOREIGN KEY (`node_id` )
    REFERENCES `ads`.`node` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

CREATE  TABLE IF NOT EXISTS `ads`.`issue` (
  `id` INT(11) NOT NULL AUTO_INCREMENT ,
  `dcase_id` INT(11) NOT NULL ,
  `its_id` VARCHAR(45) NULL DEFAULT NULL ,
  `subject` VARCHAR(500) NOT NULL ,
  `description` TEXT NULL DEFAULT NULL ,
  `created` DATETIME NULL DEFAULT NULL ,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_issue_dcase1` (`dcase_id` ASC) ,
  CONSTRAINT `fk_issue_dcase1`
    FOREIGN KEY (`dcase_id` )
    REFERENCES `ads`.`dcase` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

CREATE  TABLE IF NOT EXISTS `ads`.`monitor_node` (
  `id` INT(11) NOT NULL ,
  `dcase_id` INT(11) NOT NULL ,
  `this_node_id` INT(11) NOT NULL ,
  `preset_id` VARCHAR(45) NULL DEFAULT NULL ,
  `params` VARCHAR(1000) NULL DEFAULT NULL ,
  `rebuttal_this_node_id` INT(11) NULL DEFAULT NULL ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_monitor_node_dcase1` (`dcase_id` ASC) ,
  UNIQUE INDEX `unq_monitor_node1` (`dcase_id` ASC, `this_node_id` ASC) ,
  CONSTRAINT `fk_monitor_node_dcase1`
    FOREIGN KEY (`dcase_id` )
    REFERENCES `ads`.`dcase` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
