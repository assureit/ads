SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';

ALTER SCHEMA `ads`  DEFAULT COLLATE utf8_general_ci ;

USE `ads`;

ALTER TABLE `ads`.`dcase` COLLATE = utf8_general_ci , CHANGE COLUMN `name` `name` VARCHAR(255) NULL DEFAULT NULL  ;

ALTER TABLE `ads`.`commit` COLLATE = utf8_general_ci , CHANGE COLUMN `data` `data` TEXT NULL DEFAULT NULL COMMENT 'D-Case のオブジェクトツリー（JSON）'  , CHANGE COLUMN `message` `message` TEXT NULL DEFAULT NULL COMMENT 'コミットメッセージ'  ;

ALTER TABLE `ads`.`user` COLLATE = utf8_general_ci , CHANGE COLUMN `login_name` `login_name` VARCHAR(45) NOT NULL  ;

ALTER TABLE `ads`.`node` COLLATE = utf8_general_ci , CHANGE COLUMN `description` `description` TEXT NULL DEFAULT NULL COMMENT 'ノード説明'  , CHANGE COLUMN `node_type` `node_type` VARCHAR(45) NULL DEFAULT NULL COMMENT 'ノードタイプ（Goal等）'  ;

ALTER TABLE `ads`.`file` COLLATE = utf8_general_ci , CHANGE COLUMN `name` `name` VARCHAR(512) NOT NULL COMMENT '実ファイル名'  , CHANGE COLUMN `path` `path` VARCHAR(1024) NOT NULL COMMENT 'ADS内におけるファイルのパス名（実ファイル名は変換）'  ;

ALTER TABLE `ads`.`node_property` COLLATE = utf8_general_ci , CHANGE COLUMN `name` `name` VARCHAR(32) NOT NULL COMMENT 'プロパティ名'  , CHANGE COLUMN `value` `value` VARCHAR(128) NOT NULL COMMENT 'プロパティ値'  ;

ALTER TABLE `ads`.`issue` COLLATE = utf8_general_ci ;

ALTER TABLE `ads`.`monitor_node` COLLATE = utf8_general_ci , CHANGE COLUMN `id` `id` INT(11) NOT NULL AUTO_INCREMENT  ;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
