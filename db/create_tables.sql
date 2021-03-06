SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';


-- -----------------------------------------------------
-- Table `project`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `project` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `name` VARCHAR(1024) NOT NULL ,
  `meta_data` TEXT NULL ,
  `public_flag` TINYINT(1) NOT NULL DEFAULT FALSE ,
  `delete_flag` TINYINT(1) NOT NULL DEFAULT FALSE ,
  `last_modified` DATETIME NULL COMMENT 'プロジェクト内のDCaseが最終的に更新された日時' ,
  `created` DATETIME NULL ,
  `modified` TIMESTAMP NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `user`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `user` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `login_name` VARCHAR(45) NOT NULL ,
  `mail_address` VARCHAR(256) NULL ,
  `delete_flag` TINYINT(1) NOT NULL DEFAULT FALSE ,
  `system_flag` TINYINT(1) NOT NULL DEFAULT FALSE ,
  `created` DATETIME NULL ,
  `modified` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP ,
  PRIMARY KEY (`id`) ,
  UNIQUE INDEX `unq_user1` (`login_name` ASC) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `dcase`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `dcase` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `project_id` INT NOT NULL ,
  `user_id` INT NOT NULL ,
  `type` INT NOT NULL DEFAULT 0 COMMENT '種別\n0: 通常\n1: Stakeholderケース' ,
  `name` VARCHAR(255) NULL ,
  `delete_flag` TINYINT(1) NULL DEFAULT FALSE ,
  `created` DATETIME NULL ,
  `modified` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_dcase_project1` (`project_id` ASC) ,
  INDEX `fk_dcase_user1` (`user_id` ASC) ,
  CONSTRAINT `fk_dcase_project1`
    FOREIGN KEY (`project_id` )
    REFERENCES `project` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_dcase_user1`
    FOREIGN KEY (`user_id` )
    REFERENCES `user` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `commit`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `commit` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `data` TEXT NULL COMMENT 'D-Case のオブジェクトツリー（JSON）' ,
  `date_time` DATETIME NULL COMMENT 'コミット日時' ,
  `prev_commit_id` INT NULL COMMENT '前回コミットID' ,
  `latest_flag` TINYINT(1) NULL DEFAULT TRUE COMMENT '最新コミットフラグ 0:最新でない 1:最新' ,
  `message` TEXT NULL COMMENT 'コミットメッセージ' ,
  `meta_data` TEXT NULL ,
  `dcase_id` INT NOT NULL ,
  `user_id` INT NOT NULL ,
  `role` VARCHAR(80) NULL ,
  `created` DATETIME NULL ,
  `modified` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_commit_dcase1_idx` (`dcase_id` ASC) ,
  INDEX `fk_commit_user1_idx` (`user_id` ASC) ,
  CONSTRAINT `fk_commit_dcase1`
    FOREIGN KEY (`dcase_id` )
    REFERENCES `dcase` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_commit_user1`
    FOREIGN KEY (`user_id` )
    REFERENCES `user` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `node`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `node` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `this_node_id` INT NULL COMMENT 'D-CaseにおけるノードID' ,
  `description` TEXT NULL COMMENT 'ノード説明' ,
  `node_type` VARCHAR(45) NULL COMMENT 'ノードタイプ（Goal等）' ,
  `commit_id` INT NOT NULL ,
  `created` DATETIME NULL ,
  `modified` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_node_commit1_idx` (`commit_id` ASC) ,
  CONSTRAINT `fk_node_commit1`
    FOREIGN KEY (`commit_id` )
    REFERENCES `commit` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `file`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `file` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `name` VARCHAR(512) NOT NULL COMMENT '実ファイル名' ,
  `path` VARCHAR(1024) NOT NULL COMMENT 'ADS内におけるファイルのパス名（実ファイル名は変換）' ,
  `user_id` INT NOT NULL ,
  `created` DATETIME NULL COMMENT '作成日時' ,
  `modified` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時' ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_file_user1_idx` (`user_id` ASC) ,
  CONSTRAINT `fk_file_user1`
    FOREIGN KEY (`user_id` )
    REFERENCES `user` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `issue`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `issue` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `dcase_id` INT NOT NULL ,
  `its_id` VARCHAR(45) NULL ,
  `subject` VARCHAR(500) NOT NULL ,
  `description` TEXT NULL ,
  `created` DATETIME NULL ,
  `modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_issue_dcase1_idx` (`dcase_id` ASC) ,
  CONSTRAINT `fk_issue_dcase1`
    FOREIGN KEY (`dcase_id` )
    REFERENCES `dcase` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `monitor_node`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `monitor_node` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `dcase_id` INT NOT NULL ,
  `this_node_id` INT NOT NULL ,
  `watch_id` VARCHAR(45) NOT NULL ,
  `preset_id` VARCHAR(45) NULL ,
  `params` TEXT NULL ,
  `rebuttal_this_node_id` INT NULL ,
  `publish_status` INT NOT NULL DEFAULT 0 COMMENT 'REC登録状態\n0: 未\n1: 済\n2: 要更新' ,
  `delete_flag` TINYINT(1) NOT NULL DEFAULT FALSE ,
  `created` DATETIME NULL ,
  `modified` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP ,
  PRIMARY KEY (`id`) ,
  UNIQUE INDEX `unq_monitor_node1` (`dcase_id` ASC, `this_node_id` ASC) ,
  INDEX `fk_monitor_node_dcase1_idx` (`dcase_id` ASC) ,
  CONSTRAINT `fk_monitor_node_dcase1`
    FOREIGN KEY (`dcase_id` )
    REFERENCES `dcase` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `tag`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `tag` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `label` VARCHAR(1024) NOT NULL ,
  `created` DATETIME NULL ,
  `modified` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP ,
  PRIMARY KEY (`id`) ,
  INDEX `idx_tag1` (`label`(255) ASC) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `dcase_tag_rel`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `dcase_tag_rel` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `dcase_id` INT NOT NULL ,
  `tag_id` INT NOT NULL ,
  `created` DATETIME NULL ,
  `modified` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP ,
  PRIMARY KEY (`id`) ,
  UNIQUE INDEX `unq_dcase_tag_rel1` (`dcase_id` ASC, `tag_id` ASC) ,
  INDEX `fk_dcase_tag_rel_dcase1_idx` (`dcase_id` ASC) ,
  INDEX `fk_dcase_tag_rel_tag1_idx` (`tag_id` ASC) ,
  CONSTRAINT `fk_dcase_tag_rel_dcase1`
    FOREIGN KEY (`dcase_id` )
    REFERENCES `dcase` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_dcase_tag_rel_tag1`
    FOREIGN KEY (`tag_id` )
    REFERENCES `tag` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `project_has_user`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `project_has_user` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `project_id` INT NOT NULL ,
  `user_id` INT NOT NULL ,
  `role` VARCHAR(80) NULL ,
  `created` DATETIME NULL ,
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


-- -----------------------------------------------------
-- Table `access_log`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `access_log` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `commit_id` INT NOT NULL ,
  `user_id` INT NOT NULL ,
  `access_type` VARCHAR(45) NULL ,
  `accessed` DATETIME NULL ,
  `created` DATETIME NULL ,
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



SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
