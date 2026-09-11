# Formulário Club

Aplicação acadêmica em Node.js/Express com páginas EJS e PostgreSQL em Docker. Jogadores respondem ao questionário de bem-estar e administradores acompanham os envios.

## Pré-requisitos

- Node.js 20 ou superior
- Docker Desktop
- Git (opcional, para compartilhar o projeto)

## Como rodar

1. Abra o Docker Desktop.
2. Nesta pasta, suba o banco:

   ```bash
   docker compose up -d
   ```

3. Instale as dependências e inicie a aplicação:

   ```bash
   npm.cmd install
   npm.cmd start
   ```

4. Abra `http://localhost:3000`.

O arquivo `.env` local já está pronto para desenvolvimento. Ao publicar o sistema, troque `SESSION_SECRET` e todas as senhas.

## Acessos de demonstração

| Perfil | Usuário | Senha |
|---|---|---|
| Jogador | `jogador` | `jogador123` |
| Administrador | `admin` | `admin123` |

As senhas são armazenadas como hash bcrypt no banco.

## Estrutura do banco

- `usuario`: login, nome e perfil (`JOGADOR` ou `ADMIN`).
- `resposta_formulario`: respostas do questionário ligadas ao jogador por chave estrangeira.

O volume `postgres_data` mantém os dados mesmo quando o contêiner é parado.

## Comandos úteis

```bash
docker compose ps
docker compose logs db
docker compose down
npm.cmd run dev
npm.cmd run check
```

`docker compose down` para os serviços sem apagar as respostas. Evite `docker compose down -v`, pois o `-v` remove o volume e os dados do banco.

No Windows PowerShell, use `npm.cmd` como mostrado acima. Isso evita o bloqueio
do `npm.ps1` quando a política de execução de scripts do Windows está restrita.
O PostgreSQL deste projeto fica disponível na porta `5433`, pois a porta padrão
`5432` pode estar sendo usada por outro projeto.

## Se o Docker não iniciar no Windows

Confira no Gerenciador de Tarefas, em **Desempenho > CPU**, se aparece
`Virtualização: Habilitada`. Se estiver desabilitada, reinicie o computador,
entre na BIOS/UEFI e habilite **Intel Virtualization Technology (VT-x)**. Depois
de salvar e entrar novamente no Windows, abra o Docker Desktop antes de usar
`docker compose up -d`.
