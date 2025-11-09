--
-- PostgreSQL database dump
--

\restrict jhmHu4ddDKuYAHvUlMiYig7Lb4MOEm0VM5gdlEWvWFs5pjl8EnaMOGPS7iF9nBF

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.status_enum AS ENUM (
    'pending',
    'paid',
    'shipped',
    'delivered',
    'cancelled'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: address; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.address (
    id integer NOT NULL,
    user_id bigint NOT NULL,
    "recipient-name" character varying(100) NOT NULL,
    address_line_1 character varying(255) NOT NULL,
    address_line2 character varying(255) NOT NULL,
    city character varying(100) NOT NULL,
    state character varying(100) NOT NULL,
    postal_code bigint NOT NULL,
    country character varying(100) NOT NULL,
    phone_number character varying(20) NOT NULL,
    is_default boolean NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: address_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.address_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: address_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.address_id_seq OWNED BY public.address.id;


--
-- Name: carts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.carts (
    id integer NOT NULL,
    userid bigint NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    productid integer,
    quantity integer DEFAULT 1,
    variantid integer
);


--
-- Name: carts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.carts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: carts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.carts_id_seq OWNED BY public.carts.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(500) NOT NULL
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: newsletter; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.newsletter (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: newsletter_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.newsletter_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: newsletter_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.newsletter_id_seq OWNED BY public.newsletter.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id bigint NOT NULL,
    product_id bigint NOT NULL,
    variant_id bigint NOT NULL,
    quantity bigint NOT NULL,
    unit_price numeric(10,2) NOT NULL
);


--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id bigint NOT NULL,
    order_date timestamp without time zone DEFAULT now() NOT NULL,
    status public.status_enum DEFAULT 'pending'::public.status_enum NOT NULL,
    total_price numeric(12,2) DEFAULT 0.00 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    shipping_cost numeric DEFAULT 0
);


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(1000) NOT NULL,
    category_id bigint NOT NULL,
    brand character varying(255) NOT NULL,
    main_page_url character varying(255),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    user_id bigint NOT NULL,
    rating numeric(2,1) DEFAULT 0.0 NOT NULL,
    product_id bigint NOT NULL,
    comment character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_admin boolean DEFAULT false,
    google_id text
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: variants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.variants (
    id integer NOT NULL,
    product_id bigint NOT NULL,
    variant_type character varying(255) NOT NULL,
    variant_value character varying(255) NOT NULL,
    price numeric(10,2) NOT NULL,
    stock_quantity bigint NOT NULL
);


--
-- Name: variants_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.variants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: variants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.variants_id_seq OWNED BY public.variants.id;


--
-- Name: address id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.address ALTER COLUMN id SET DEFAULT nextval('public.address_id_seq'::regclass);


--
-- Name: carts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts ALTER COLUMN id SET DEFAULT nextval('public.carts_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: newsletter id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter ALTER COLUMN id SET DEFAULT nextval('public.newsletter_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: variants id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.variants ALTER COLUMN id SET DEFAULT nextval('public.variants_id_seq'::regclass);


--
-- Data for Name: address; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.address (id, user_id, "recipient-name", address_line_1, address_line2, city, state, postal_code, country, phone_number, is_default, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.carts (id, userid, created_at, updated_at, productid, quantity, variantid) FROM stdin;
95	27	2025-11-09 01:47:17.769447	2025-11-09 01:47:17.769447	8	1	16
96	27	2025-11-09 02:39:39.165126	2025-11-09 02:39:39.165126	4	1	7
97	27	2025-11-09 02:49:28.473537	2025-11-09 02:49:28.473537	3	1	6
87	23	2025-10-29 05:28:01.260712	2025-10-29 05:28:01.260712	8	1	15
88	23	2025-11-01 03:14:02.522796	2025-11-01 03:14:02.522796	4	1	7
89	23	2025-11-01 03:18:05.903063	2025-11-01 03:18:05.903063	7	2	13
90	23	2025-11-01 03:25:05.063917	2025-11-01 03:25:05.063917	3	2	6
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, description) FROM stdin;
1	Hair Care	Products for hair health, styling and mainttenance
2	Skin Care	Products for skin hydration, cleansing, and protection
3	Makeup	Cosmetics for face, eyes, lips, and nails
4	Fragrances	Perfumes, colognes, and body sprays
5	Supplements	Vitamins, minerals, and other health supplements
\.


--
-- Data for Name: newsletter; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.newsletter (id, email, created_at) FROM stdin;
1	zee@dmail.com	2025-11-01 00:19:10.577138
2	leezabethyomi@gmail.com	2025-11-01 00:19:59.836869
3	leezab3th@gmail.com	2025-11-09 10:18:57.588812
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, order_id, product_id, variant_id, quantity, unit_price) FROM stdin;
1	5	2	3	1	12.99
2	5	2	4	1	19.99
3	6	2	3	2	12.99
4	6	2	4	2	19.99
5	7	6	11	1	39.99
6	7	6	12	1	44.99
7	8	6	11	1	39.99
8	8	6	12	1	44.99
9	9	3	5	1	13.99
10	9	3	6	1	21.99
11	10	3	5	1	13.99
12	10	3	6	1	21.99
13	11	3	5	2	13.99
14	11	3	6	2	21.99
15	12	3	5	1	13.99
16	12	3	6	1	21.99
17	13	3	5	1	13.99
18	13	3	6	1	21.99
19	14	3	5	2	13.99
20	14	3	6	2	21.99
21	15	3	5	2	13.99
22	15	3	6	2	21.99
23	16	2	3	1	12.99
24	16	2	4	1	19.99
25	17	2	3	1	12.99
26	17	2	4	1	19.99
27	18	3	5	1	13.99
28	18	3	6	1	21.99
29	19	3	5	1	13.99
30	19	3	6	1	21.99
31	20	2	3	2	12.99
32	21	2	3	2	12.99
33	20	2	4	2	19.99
34	21	2	4	2	19.99
39	26	3	5	2	13.99
40	26	2	3	1	12.99
41	27	3	5	2	13.99
42	27	2	3	1	12.99
43	28	2	3	1	12.99
44	29	2	3	1	12.99
45	30	2	3	1	12.99
46	30	2	4	1	19.99
47	31	2	3	1	12.99
48	31	2	4	1	19.99
51	39	6	5	2	13.99
52	40	2	3	1	12.99
53	41	3	6	1	21.99
54	41	2	4	11	19.99
55	41	2	3	1	12.99
56	42	2	4	1	19.99
57	43	2	4	1	19.99
58	44	2	4	1	19.99
59	45	2	3	1	12.99
60	46	2	3	1	12.99
61	47	2	4	1	19.99
62	48	2	4	1	19.99
63	49	6	5	2	13.99
64	50	2	3	3	12.99
65	51	2	3	3	12.99
66	52	3	6	1	21.99
67	52	4	7	1	29.99
68	53	4	7	1	29.99
69	53	3	6	2	21.99
70	53	5	9	1	14.99
71	54	4	7	1	29.99
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, user_id, order_date, status, total_price, created_at, updated_at, shipping_cost) FROM stdin;
5	2	2025-09-16 03:46:55.549467	paid	32.98	2025-09-16 03:46:55.549467	2025-09-16 03:46:55.549467	0
6	2	2025-09-16 05:01:15.309784	paid	65.96	2025-09-16 05:01:15.309784	2025-09-16 05:01:15.309784	0
7	22	2025-09-17 00:48:17.837595	paid	84.98	2025-09-17 00:48:17.837595	2025-09-17 00:48:17.837595	0
8	23	2025-10-14 21:03:44.67347	paid	84.98	2025-10-14 21:03:44.67347	2025-10-14 21:03:44.67347	0
9	23	2025-10-26 16:22:56.522177	paid	40.98	2025-10-26 16:22:56.522177	2025-10-26 16:22:56.522177	5
10	23	2025-10-26 16:39:44.3322	paid	40.98	2025-10-26 16:39:44.3322	2025-10-26 16:39:44.3322	5
11	23	2025-10-26 16:57:25.208877	paid	76.96	2025-10-26 16:57:25.208877	2025-10-26 16:57:25.208877	5
12	23	2025-10-26 17:32:54.288499	paid	40.98	2025-10-26 17:32:54.288499	2025-10-26 17:32:54.288499	5
13	23	2025-10-26 17:32:54.294878	paid	40.98	2025-10-26 17:32:54.294878	2025-10-26 17:32:54.294878	5
14	23	2025-10-26 18:07:42.948619	paid	76.96	2025-10-26 18:07:42.948619	2025-10-26 18:07:42.948619	5
15	23	2025-10-26 18:07:43.021147	paid	76.96	2025-10-26 18:07:43.021147	2025-10-26 18:07:43.021147	5
16	23	2025-10-26 18:23:46.113048	paid	37.98	2025-10-26 18:23:46.113048	2025-10-26 18:23:46.113048	5
17	23	2025-10-26 18:23:46.161822	paid	37.98	2025-10-26 18:23:46.161822	2025-10-26 18:23:46.161822	5
18	23	2025-10-26 18:30:33.789972	paid	40.98	2025-10-26 18:30:33.789972	2025-10-26 18:30:33.789972	5
19	23	2025-10-26 18:30:33.88226	paid	40.98	2025-10-26 18:30:33.88226	2025-10-26 18:30:33.88226	5
20	23	2025-10-26 18:51:09.77368	paid	70.96	2025-10-26 18:51:09.77368	2025-10-26 18:51:09.77368	5
21	23	2025-10-26 18:51:09.779054	paid	70.96	2025-10-26 18:51:09.779054	2025-10-26 18:51:09.779054	5
22	23	2025-10-26 19:42:58.768109	paid	0.00	2025-10-26 19:42:58.768109	2025-10-26 19:42:58.768109	5
23	23	2025-10-26 19:42:58.85406	paid	0.00	2025-10-26 19:42:58.85406	2025-10-26 19:42:58.85406	5
24	23	2025-10-26 19:44:31.484427	paid	0.00	2025-10-26 19:44:31.484427	2025-10-26 19:44:31.484427	5
25	23	2025-10-26 19:44:31.715247	paid	0.00	2025-10-26 19:44:31.715247	2025-10-26 19:44:31.715247	5
26	23	2025-10-26 19:55:03.776196	paid	45.97	2025-10-26 19:55:03.776196	2025-10-26 19:55:03.776196	5
27	23	2025-10-26 19:55:03.868478	paid	45.97	2025-10-26 19:55:03.868478	2025-10-26 19:55:03.868478	5
28	23	2025-10-26 20:57:45.110039	paid	17.99	2025-10-26 20:57:45.110039	2025-10-26 20:57:45.110039	5
29	23	2025-10-26 20:57:45.17812	paid	17.99	2025-10-26 20:57:45.17812	2025-10-26 20:57:45.17812	5
30	23	2025-10-26 21:09:57.457381	paid	37.98	2025-10-26 21:09:57.457381	2025-10-26 21:09:57.457381	5
31	23	2025-10-26 21:09:57.590361	paid	37.98	2025-10-26 21:09:57.590361	2025-10-26 21:09:57.590361	5
32	23	2025-10-26 22:24:06.420527	paid	0.00	2025-10-26 22:24:06.420527	2025-10-26 22:24:06.420527	5
33	23	2025-10-26 22:24:46.112986	paid	0.00	2025-10-26 22:24:46.112986	2025-10-26 22:24:46.112986	5
34	23	2025-10-26 22:26:27.986867	paid	0.00	2025-10-26 22:26:27.986867	2025-10-26 22:26:27.986867	5
35	23	2025-10-26 22:28:12.718271	paid	0.00	2025-10-26 22:28:12.718271	2025-10-26 22:28:12.718271	5
36	23	2025-10-26 22:39:53.828701	paid	0.00	2025-10-26 22:39:53.828701	2025-10-26 22:39:53.828701	5
37	23	2025-10-26 22:42:18.495439	paid	0.00	2025-10-26 22:42:18.495439	2025-10-26 22:42:18.495439	5
38	23	2025-10-26 22:42:18.700083	paid	0.00	2025-10-26 22:42:18.700083	2025-10-26 22:42:18.700083	5
39	23	2025-10-26 22:50:34.110679	paid	32.98	2025-10-26 22:50:34.110679	2025-10-26 22:50:34.110679	5
40	23	2025-10-27 00:16:51.674267	paid	17.99	2025-10-27 00:16:51.674267	2025-10-27 00:16:51.674267	5
41	23	2025-10-27 02:59:02.491435	paid	259.87	2025-10-27 02:59:02.491435	2025-10-27 02:59:02.491435	5
42	23	2025-10-27 03:00:09.59482	paid	24.99	2025-10-27 03:00:09.59482	2025-10-27 03:00:09.59482	5
43	23	2025-10-27 03:00:09.649671	paid	24.99	2025-10-27 03:00:09.649671	2025-10-27 03:00:09.649671	5
44	23	2025-10-27 03:00:09.654537	paid	24.99	2025-10-27 03:00:09.654537	2025-10-27 03:00:09.654537	5
45	23	2025-10-27 03:07:50.350319	paid	17.99	2025-10-27 03:07:50.350319	2025-10-27 03:07:50.350319	5
46	23	2025-10-27 03:07:50.511881	paid	17.99	2025-10-27 03:07:50.511881	2025-10-27 03:07:50.511881	5
47	23	2025-10-27 03:13:39.097482	paid	24.99	2025-10-27 03:13:39.097482	2025-10-27 03:13:39.097482	5
48	23	2025-10-27 03:13:39.144078	paid	24.99	2025-10-27 03:13:39.144078	2025-10-27 03:13:39.144078	5
49	23	2025-10-27 03:20:36.820388	paid	32.98	2025-10-27 03:20:36.820388	2025-10-27 03:20:36.820388	5
50	23	2025-10-27 03:21:35.190728	paid	43.97	2025-10-27 03:21:35.190728	2025-10-27 03:21:35.190728	5
51	23	2025-10-27 03:21:35.274803	paid	43.97	2025-10-27 03:21:35.274803	2025-10-27 03:21:35.274803	5
52	23	2025-10-27 03:46:47.424384	pending	56.98	2025-10-27 03:46:47.424384	2025-10-27 03:46:47.424384	5
53	23	2025-10-27 04:00:22.237872	pending	93.96	2025-10-27 04:00:22.237872	2025-10-27 04:00:22.237872	5
54	23	2025-10-27 05:12:16.247275	pending	34.99	2025-10-27 05:12:16.247275	2025-10-27 05:12:16.247275	5
55	23	2025-10-27 05:51:36.779221	pending	56.98	2025-10-27 05:51:36.779221	2025-10-27 05:51:36.779221	5
56	23	2025-10-27 05:57:54.637519	pending	56.98	2025-10-27 05:57:54.637519	2025-10-27 05:57:54.637519	5
57	23	2025-10-27 06:01:49.84315	pending	100.96	2025-10-27 06:01:49.84315	2025-10-27 06:01:49.84315	5
58	23	2025-10-27 06:52:58.768252	pending	86.97	2025-10-27 06:52:58.768252	2025-10-27 06:52:58.768252	5
59	23	2025-10-27 06:55:55.871861	pending	101.96	2025-10-27 06:55:55.871861	2025-10-27 06:55:55.871861	5
60	23	2025-10-27 09:42:54.60765	pending	34.99	2025-10-27 09:42:54.60765	2025-10-27 09:42:54.60765	5
61	23	2025-10-27 10:00:10.306158	pending	26.99	2025-10-27 10:00:10.306158	2025-10-27 10:00:10.306158	5
62	23	2025-10-28 01:55:14.63787	pending	61.98	2025-10-28 01:55:14.63787	2025-10-28 01:55:14.63787	10
63	24	2025-10-28 02:49:25.621973	pending	26.99	2025-10-28 02:49:25.621973	2025-10-28 02:49:25.621973	5
64	24	2025-10-28 03:29:02.571015	pending	34.99	2025-10-28 03:29:02.571015	2025-10-28 03:29:02.571015	5
65	24	2025-10-28 03:41:27.636347	pending	104.98	2025-10-28 03:41:27.636347	2025-10-28 03:41:27.636347	5
66	24	2025-10-28 03:44:14.554453	pending	134.97	2025-10-28 03:44:14.554453	2025-10-28 03:44:14.554453	5
67	24	2025-10-28 03:51:13.62926	pending	179.95	2025-10-28 03:51:13.62926	2025-10-28 03:51:13.62926	5
68	24	2025-10-28 03:54:16.141574	pending	209.93	2025-10-28 03:54:16.141574	2025-10-28 03:54:16.141574	5
69	24	2025-10-28 04:01:44.640151	pending	239.92	2025-10-28 04:01:44.640151	2025-10-28 04:01:44.640151	5
70	24	2025-10-28 04:14:39.848771	pending	54.99	2025-10-28 04:14:39.848771	2025-10-28 04:14:39.848771	5
71	23	2025-10-28 04:25:09.275721	pending	54.99	2025-10-28 04:25:09.275721	2025-10-28 04:25:09.275721	5
72	23	2025-10-28 04:49:57.23958	pending	89.98	2025-10-28 04:49:57.23958	2025-10-28 04:49:57.23958	10
73	23	2025-10-28 05:06:56.458938	pending	134.97	2025-10-28 05:06:56.458938	2025-10-28 05:06:56.458938	5
74	23	2025-10-28 05:09:38.359234	pending	184.96	2025-10-28 05:09:38.359234	2025-10-28 05:09:38.359234	5
75	23	2025-10-28 05:32:27.976665	paid	199.95	2025-10-28 05:32:27.976665	2025-10-28 05:32:27.976665	5
76	23	2025-10-28 06:18:15.367951	paid	19.99	2025-10-28 06:18:15.367951	2025-10-28 06:18:15.367951	5
77	23	2025-10-28 06:19:46.953527	paid	54.99	2025-10-28 06:19:46.953527	2025-10-28 06:19:46.953527	5
78	23	2025-10-28 06:22:47.321081	paid	54.99	2025-10-28 06:22:47.321081	2025-10-28 06:22:47.321081	5
79	23	2025-10-28 06:25:56.347611	paid	19.99	2025-10-28 06:25:56.347611	2025-10-28 06:25:56.347611	5
80	24	2025-10-28 06:44:50.949087	pending	84.97	2025-10-28 06:44:50.949087	2025-10-28 06:44:50.949087	5
81	23	2025-10-28 07:27:20.074645	paid	104.99	2025-10-28 07:27:20.074645	2025-10-28 07:27:20.074645	5
82	23	2025-10-28 07:40:22.101774	paid	104.99	2025-10-28 07:40:22.101774	2025-10-28 07:40:22.101774	5
83	23	2025-10-28 07:42:52.900629	paid	34.99	2025-10-28 07:42:52.900629	2025-10-28 07:42:52.900629	5
84	23	2025-10-28 08:12:21.29454	paid	34.99	2025-10-28 08:12:21.29454	2025-10-28 08:12:21.29454	5
85	23	2025-10-28 08:15:22.984505	paid	54.99	2025-10-28 08:15:22.984505	2025-10-28 08:15:22.984505	5
86	23	2025-10-28 08:27:03.335428	paid	104.99	2025-10-28 08:27:03.335428	2025-10-28 08:27:03.335428	5
87	23	2025-10-28 08:28:58.329781	paid	19.99	2025-10-28 08:28:58.329781	2025-10-28 08:28:58.329781	5
88	23	2025-10-28 08:36:51.527207	paid	34.99	2025-10-28 08:36:51.527207	2025-10-28 08:36:51.527207	5
89	23	2025-10-28 08:39:58.271234	paid	34.99	2025-10-28 08:39:58.271234	2025-10-28 08:39:58.271234	5
90	23	2025-10-28 09:08:26.31594	paid	26.99	2025-10-28 09:08:26.31594	2025-10-28 09:08:26.31594	5
91	23	2025-10-28 09:13:45.684443	paid	34.99	2025-10-28 09:13:45.684443	2025-10-28 09:13:45.684443	5
92	23	2025-10-28 09:14:54.15464	paid	19.99	2025-10-28 09:14:54.15464	2025-10-28 09:14:54.15464	5
93	23	2025-10-28 09:17:43.99929	paid	34.99	2025-10-28 09:17:43.99929	2025-10-28 09:17:43.99929	5
94	27	2025-10-29 03:50:59.891162	paid	24.99	2025-10-29 03:50:59.891162	2025-10-29 03:50:59.891162	5
95	27	2025-11-01 17:04:55.691169	paid	663.85	2025-11-01 17:04:55.691169	2025-11-01 17:04:55.691169	5
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, name, description, category_id, brand, main_page_url, created_at, updated_at) FROM stdin;
16	Hair Boosting Serum 	A serum to boost hair shine	1	L'Oreal	/images/L'Oreal-Hair-Serum.png	2025-10-14 21:27:59.048419	2025-10-14 21:27:59.048419
3	Argan Oil Conditioner	Nourishing conditioner with argan oil	1	Moroccanoil	/images/morroccanoil.png	2025-08-22 11:16:39.939822	2025-08-22 11:16:39.939822
2	Shea Rich Shampoo	Hydrating shampoo for dry hair	1	SheaMoisture	/images/Deep-Moisturising-Shampoo.png	2025-08-22 11:16:39.939822	2025-08-22 11:16:39.939822
4	Keratin Repair Mask	Deep treatment for damaged hair	1	Olaplex	/images/Olaplex-Hair-Mask.png	2025-08-22 11:16:39.939822	2025-08-22 11:16:39.939822
6	Ceramic Hair Straightener	Flat iron with adjustable heat settings	1	Remington	/images/Remington.png	2025-08-22 11:16:39.939822	2025-08-22 11:16:39.939822
7	Ionic Hair Dryer	Fast-drying ionic technology with diffuser	1	Dyson	/images/Dyson-Icon-Hair-Dryer.png	2025-08-22 11:16:39.939822	2025-08-22 11:16:39.939822
8	Curling Wand Set	Multi-barrel curling wand for different styles	1	Conair	/images/Conair-Curling-Wand-Set.png	2025-08-22 11:16:39.939822	2025-08-22 11:16:39.939822
5	EIP	Emily in Paris Secret Serum	1	Pantene	/images/Emily-In-Paris.png	2025-08-22 11:16:39.939822	2025-08-22 11:16:39.939822
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, user_id, rating, product_id, comment, created_at, updated_at) FROM stdin;
8	2	5.0	2	Absolutely love this shampoo! My hair feels so soft.	2025-08-22 12:13:47.831094	2025-08-22 12:13:47.831094
9	3	4.0	2	Good product, but a bit pricey.	2025-08-22 12:13:47.831094	2025-08-22 12:13:47.831094
10	4	5.0	3	The moisturizer works wonders for my skin.	2025-08-22 12:13:47.831094	2025-08-22 12:13:47.831094
11	5	3.5	4	Decent quality, expected better color payoff.	2025-08-22 12:13:47.831094	2025-08-22 12:13:47.831094
12	6	4.5	2	Nice scent and hydration, would buy again.	2025-08-22 12:13:47.831094	2025-08-22 12:13:47.831094
13	3	5.0	4	Perfect gift for my friend, she loved it!	2025-08-22 12:13:47.831094	2025-08-22 12:13:47.831094
14	2	4.0	3	Hydrating but slightly oily for my skin type.	2025-08-22 12:13:47.831094	2025-08-22 12:13:47.831094
15	2	5.0	2	Absolutely love this shampoo! My hair feels so soft.	2025-08-22 12:17:47.092682	2025-08-22 12:17:47.092682
16	3	4.0	2	Good product, but a bit pricey.	2025-08-22 12:17:47.092682	2025-08-22 12:17:47.092682
17	4	5.0	3	The conditioner works wonders for my scalp.	2025-08-22 12:17:47.092682	2025-08-22 12:17:47.092682
18	5	3.5	4	Decent quality, expected better color payoff.	2025-08-22 12:17:47.092682	2025-08-22 12:17:47.092682
19	6	4.5	2	Nice scent and hydration, would buy again.	2025-08-22 12:17:47.092682	2025-08-22 12:17:47.092682
20	3	5.0	4	Perfect gift for my friend, she loved it!	2025-08-22 12:17:47.092682	2025-08-22 12:17:47.092682
21	2	4.0	3	Hydrating but slightly oily for my skin type.	2025-08-22 12:17:47.092682	2025-08-22 12:17:47.092682
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session (sid, sess, expire) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, email, password, created_at, updated_at, is_admin, google_id) FROM stdin;
2	Alice Johnson	alice@example.com	password123	2025-08-22 12:01:33.245888	2025-08-22 12:01:33.245888	f	\N
3	Bob Smith	bob@example.com	password123	2025-08-22 12:01:33.245888	2025-08-22 12:01:33.245888	f	\N
4	Charlie Lee	charlie@example.com	password123	2025-08-22 12:01:33.245888	2025-08-22 12:01:33.245888	f	\N
5	Diana Prince	diana@example.com	password123	2025-08-22 12:01:33.245888	2025-08-22 12:01:33.245888	f	\N
6	Ethan Hunt	ethan@example.com	password123	2025-08-22 12:01:33.245888	2025-08-22 12:01:33.245888	f	\N
7	Alice Johnson	alice@example.com	password123	2025-08-22 12:01:48.320876	2025-08-22 12:01:48.320876	f	\N
8	Bob Smith	bob@example.com	password123	2025-08-22 12:01:48.320876	2025-08-22 12:01:48.320876	f	\N
9	Charlie Lee	charlie@example.com	password123	2025-08-22 12:01:48.320876	2025-08-22 12:01:48.320876	f	\N
10	Diana Prince	diana@example.com	password123	2025-08-22 12:01:48.320876	2025-08-22 12:01:48.320876	f	\N
11	Ethan Hunt	ethan@example.com	password123	2025-08-22 12:01:48.320876	2025-08-22 12:01:48.320876	f	\N
12	lizzy	lizzy@example.com	$2b$10$eK1GlvmkdcVkF9jYX01ThuhtXLuFb9ln6lcFkVgDghH9DvSdMH/BG	2025-09-09 19:29:17.355017	2025-09-09 19:29:17.355017	f	\N
20	seanppi	sp@example1.com	$2b$10$N2lXk2279rWOKvW6XJYi0uimZIgn/ODplnMZ8RCoyjaiV1MnZt0uO	2025-09-11 18:26:38.366328	2025-09-11 18:26:38.366328	t	\N
21	biddo	bo@example1.com	$2b$10$InJhSsGDHp92Vbzy5N651eFPzgO.m4ah6IM5MMFe0nx8gHIz9jvie	2025-09-11 18:30:59.464492	2025-09-11 18:30:59.464492	f	\N
22	bbi	bit@dmail.com	$2b$10$lM2WCmf2nV3NmcMjzqMGCOYAruxVHbtethRS7ceXGrTD9QDYRoqyO	2025-09-17 00:19:15.86539	2025-09-17 00:19:15.86539	t	\N
24	Elizabeth	zee@dmail.com	$2b$10$z.LTx478YStS6SQLmtKTlOsVAY5XEpCFrNjKA20SmIXxxWTQ4jO7e	2025-10-28 02:48:15.466478	2025-10-28 02:48:15.466478	f	\N
27	Elizabeth Yomi	leezabethyomi@gmail.com	\N	2025-10-28 21:32:18.372824	2025-10-28 21:32:18.372824	f	106786019750992749761
23	samuel	sam@dmail.com	$2b$10$ZKwMXSUjqI6A/B9f.fFg8.WZbhK.iFjHnoCJ7gIoT0WpuAoFlvaa.	2025-10-14 20:58:55.979822	2025-10-14 20:58:55.979822	t	\N
\.


--
-- Data for Name: variants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.variants (id, product_id, variant_type, variant_value, price, stock_quantity) FROM stdin;
7	4	Size	200ml	29.99	20
8	4	Size	400ml	49.99	15
9	5	Size	100ml	14.99	35
10	5	Size	200ml	24.99	20
13	7	Color	Black	99.99	20
14	7	Color	White	99.99	15
15	8	Barrel Size	19-25mm	49.99	25
16	8	Barrel Size	25-32mm	49.99	20
11	6	Plate Width	1 inch	39.99	13
12	6	Plate Width	1.5 inch	44.99	8
17	16	size	100ml	29.99	50
6	3	Size	500ml	21.99	12
4	2	Size	500ml	19.99	3
5	3	Size	250ml	13.99	24
3	2	Size	250ml	12.99	29
\.


--
-- Name: address_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.address_id_seq', 1, false);


--
-- Name: carts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.carts_id_seq', 97, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 7, true);


--
-- Name: newsletter_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.newsletter_id_seq', 3, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_items_id_seq', 71, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.orders_id_seq', 95, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.products_id_seq', 16, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reviews_id_seq', 21, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 27, true);


--
-- Name: variants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.variants_id_seq', 17, true);


--
-- Name: address address_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.address
    ADD CONSTRAINT address_pkey PRIMARY KEY (id);


--
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: newsletter newsletter_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter
    ADD CONSTRAINT newsletter_email_key UNIQUE (email);


--
-- Name: newsletter newsletter_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter
    ADD CONSTRAINT newsletter_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: users users_google_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key UNIQUE (google_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: variants variants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.variants
    ADD CONSTRAINT variants_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: address address_fk1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.address
    ADD CONSTRAINT address_fk1 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: carts carts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_user_id_fkey FOREIGN KEY (userid) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: carts carts_variantid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_variantid_fkey FOREIGN KEY (variantid) REFERENCES public.variants(id);


--
-- Name: carts fk_product; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT fk_product FOREIGN KEY (productid) REFERENCES public.products(id);


--
-- Name: order_items order_items_fk1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_fk1 FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: order_items order_items_fk2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_fk2 FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: order_items order_items_fk3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_fk3 FOREIGN KEY (variant_id) REFERENCES public.variants(id);


--
-- Name: orders orders_fk1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_fk1 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: products products_fk3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_fk3 FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: reviews reviews_fk1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_fk1 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: reviews reviews_fk3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_fk3 FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: variants variants_fk1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.variants
    ADD CONSTRAINT variants_fk1 FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- PostgreSQL database dump complete
--

\unrestrict jhmHu4ddDKuYAHvUlMiYig7Lb4MOEm0VM5gdlEWvWFs5pjl8EnaMOGPS7iF9nBF

