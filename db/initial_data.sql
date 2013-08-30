INSERT INTO user (id, login_name, system_flag, created, modified) values (1, 'system', TRUE, now(), now());
INSERT INTO project (id, name, public_flag, created, modified) values (1, 'default', TRUE, now(), now());
insert into project_has_user (project_id, user_id, role) values (1, 1, 'system');
