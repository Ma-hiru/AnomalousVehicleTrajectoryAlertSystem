use avtas;
insert ignore into actions (actionId, actionName)
VALUES (0, '正常'),
       (1, '逆行'),
       (2, '超速'),
       (3, '变道'),
       (4, '占应急道'),
       (5, '低速'),
       (6, '停车');
select *
from actions