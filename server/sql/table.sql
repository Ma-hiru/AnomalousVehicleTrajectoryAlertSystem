create database if not exists avtas;
use avtas;
create table if not exists cars
(
    carId varchar(10) primary key
);
create table if not exists streams
(
    streamId   int primary key auto_increment,
    streamName varchar(20) unique not null,
    addr       varchar(20),
    latitude   DOUBLE             not null default -1,
    longitude  DOUBLE             not null default -1
);
create table if not exists actions
(
    actionId   int8 primary key auto_increment,
    actionName varchar(20) unique not null
);
create table if not exists records
(
    recordId varchar(15) primary key,
    carId    varchar(10) not null,
    streamId int         not null,
    actionId int8,
    time     bigint      not null
);
create index idx_time on records (time);
