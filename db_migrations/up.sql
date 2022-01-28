
CREATE EXTENSION "uuid-ossp";
CREATE TABLE audio (
    id          UUID NOT NULL DEFAULT uuid_generate_v4(),
    name        TEXT,
    duration    INTEGER,
    storage_id  TEXT
);
