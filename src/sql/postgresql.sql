CREATE TABLE WEB_ACCESS(
	ID SERIAL PRIMARY KEY,
	IP4 nchar(15) NOT NULL,
	IP6 nchar(39) NULL,
	COUNTRY varchar(50) NULL,
	COUNTRY_CODE nchar(3) NULL,
	CITY varchar(50) NULL,
	CONTINENT varchar(50) NULL,
	LATITUDE numeric(9, 6) NULL,
	LONGITUDE numeric(9, 6) NULL,
	TIMEZONE varchar(50) NULL,
	POSTAL_CODE varchar(10) NULL,
	ISP_NAME varchar(50) NULL,
	USER_AGENT varchar(512) NULL,
	VISIT_DATETIME timestamp NOT NULL DEFAULT NOW()::timestamp,
	VISIT_URL varchar(512) NULL
);
