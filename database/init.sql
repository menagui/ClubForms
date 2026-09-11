CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS usuario (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(20) NOT NULL
        CHECK (tipo_usuario IN ('JOGADOR', 'ADMIN')),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resposta_formulario (
    id_resposta SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    recuperacao INTEGER NOT NULL
        CHECK (recuperacao BETWEEN 1 AND 10),
    horas_sono INTEGER NOT NULL
        CHECK (horas_sono BETWEEN 1 AND 10),
    qualidade_sono INTEGER NOT NULL
        CHECK (qualidade_sono BETWEEN 1 AND 7),
    nivel_estresse INTEGER NOT NULL
        CHECK (nivel_estresse BETWEEN 1 AND 7),
    nivel_fadiga INTEGER NOT NULL
        CHECK (nivel_fadiga BETWEEN 1 AND 7),
    nivel_hidratacao INTEGER NOT NULL
        CHECK (nivel_hidratacao BETWEEN 1 AND 8),
    dor_localizada VARCHAR(255),
    grau_dor INTEGER
        CHECK (grau_dor BETWEEN 1 AND 10),
    data_resposta TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_resposta_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_resposta_usuario_data
    ON resposta_formulario (id_usuario, data_resposta DESC);

INSERT INTO usuario (nome, username, senha, tipo_usuario)
VALUES
    ('Administrador', 'admin', crypt('admin123', gen_salt('bf', 10)), 'ADMIN'),
    ('Jogador Demonstração', 'jogador', crypt('jogador123', gen_salt('bf', 10)), 'JOGADOR')
ON CONFLICT (username) DO NOTHING;
