insert into project (id, name) select id, name from dcase;
insert into project_has_user (project_id, user_id) select id, user_id from dcase;
update dcase set project_id = id;