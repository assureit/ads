INSERT INTO project (id, name, public_flag, created, modified) values (1, 'default', TRUE, now(), now());
insert into project (id, name) select id+1, name from dcase;
insert into project_has_user (project_id, user_id) select id+1, user_id from dcase;
update dcase set project_id = id+1;