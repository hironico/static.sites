CREATE TABLE public.web_access (
    id integer NOT NULL,
    ip4 character(15),
    ip6 character(39),
    country character varying(50),
    country_code character(3),
    city character varying(50),
    continent character varying(50),
    latitude numeric(9,6),
    longitude numeric(9,6),
    timezone character varying(50),
    postal_code character varying(10),
    isp_name character varying(50),
    user_agent character varying(512),
    visit_datetime timestamp without time zone DEFAULT (now())::timestamp without time zone NOT NULL,
    visit_url character varying(512)
);

CREATE SEQUENCE public.web_access_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE ONLY public.web_access ALTER COLUMN id SET DEFAULT nextval('public.web_access_id_seq'::regclass);

ALTER TABLE ONLY public.web_access
    ADD CONSTRAINT web_access_pkey PRIMARY KEY (id);