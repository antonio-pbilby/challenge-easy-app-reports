### Instalação de dependências

Necessário: Node v20.

```
npm install
```

### Subir o banco

O projeto usa uma imagem do Postgres v15 num container docker, para executar é necessário ter o docker instalado na máquina:

```
docker compose up
```

### Subir o projeto em desenvolvimento

```
npm run dev
```

### Buildar para produção

```
npm run build
```

### Rodar a build

```
docker compose up app
```

### Rodar o banco e a build

```
docker compose up
```

### Configurar as variáveis de ambiente

Use de exemplo o arquivo na raiz do projeto `.env.example`
