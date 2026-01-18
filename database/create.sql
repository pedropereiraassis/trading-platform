drop schema if exists trading_platform;

create schema trading_platform;

create table trading_platform.account (
    account_id  uuid primary key,
    name  text,
    email text,
    document text,
    password text
);