SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';

CREATE SCHEMA IF NOT EXISTS `ads` DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ;
USE `ads` ;

CREATE SCHEMA IF NOT EXISTS `ads_test` DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ;
USE `ads_test` ;

grant all privileges on *.* to ads_test identified by 'ads_test';
grant all privileges on *.* to ads_test@'localhost' identified by 'ads_test';

-- TODO アプリ用DBへの権限削除
grant all privileges on *.* to ads identified by 'ads_test';
grant all privileges on *.* to ads@'localhost' identified by 'ads_test';
