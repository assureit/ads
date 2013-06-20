ALTER TABLE `ads`.`user` DROP COLUMN `name` , ADD COLUMN `login_name` VARCHAR(45) NOT NULL  AFTER `id` 
, DROP INDEX `unq_user1` 
, ADD UNIQUE INDEX `unq_user1` (`login_name` ASC) ;
