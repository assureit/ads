SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';

ALTER TABLE `ads`.`dcase` DROP FOREIGN KEY `fk_dcase_project1` ;

ALTER TABLE `ads`.`dcase` CHANGE COLUMN `project_id` `project_id` INT(11) NOT NULL  , 
  ADD CONSTRAINT `fk_dcase_project1`
  FOREIGN KEY (`project_id` )
  REFERENCES `ads`.`project` (`id` )
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
