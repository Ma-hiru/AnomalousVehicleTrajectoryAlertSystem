create database if not exists avtas
    character set = utf8mb4
    collate = utf8mb4_unicode_ci;
use avtas;
create table if not exists cars
(
    carId varchar(15) primary key
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
    recordId bigint primary key auto_increment,
    carId    varchar(15) not null,
    streamId int         not null,
    actionId int8,
    time     bigint      not null
);
create index idx_time on records (time);
