use avtas;

insert ignore into streams (streamName, addr, latitude, longitude)
VALUES ('Test', 'test', 15, 15);

select *
from actions