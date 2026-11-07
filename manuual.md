# 📘 Manual Operacional Superpostiz (Guia Definitivo de Produção)

Este documento resume toda a arquitetura, configurações e comandos para você nunca mais perder tempo se precisar recriar ou atualizar o ambiente.

---

## 🏗️ 1. Arquitetura do Sistema
* **Base:** Fork Postiz v2.11.3 (pré-Temporal, leve e estável).
* **Fila / Workers:** Redis 7 (BullMQ) — sem o consumo pesado de RAM do Temporal/Elasticsearch.
* **Banco de Dados:** PostgreSQL 17 (Prisma ORM restaurado com enums nativos).
* **Segurança:** Node.js `22.23.4` (patch oficial para a vulnerabilidade Brotli / Node2Shell).
* **Rede:**
  * Host VPS: Nginx (portas 80/443 com SSL Certbot) encaminha para `127.0.0.1:5000`.
  * Container: Nginx interno direciona `/api/` (NestJS 3000), `/uploads/` e `/` (Next.js 4200).
  * Postgres e Redis: 100% isolados na rede interna Docker (`postiz-network`).

---

## 🚀 2. Deploy na VPS (Passo a Passo)

### A. Estrutura de Pastas na VPS
Crie e entre na pasta da aplicação:
```bash
mkdir -p /root/superpostiz && cd /root/superpostiz
```

### B. Arquivo `.env`
Gere senhas seguras no terminal com:
```bash
openssl rand -hex 32
```
Crie o arquivo `nano .env`:
```env
# BANCO DE DADOS
POSTGRES_USER=superpost
POSTGRES_PASSWORD=SUA_SENHA_AQUI
POSTGRES_DB=superpostiz

# DOMÍNIO E URLS
FRONTEND_URL=https://superpost.shop
NEXT_PUBLIC_BACKEND_URL=https://superpost.shop/api
BACKEND_INTERNAL_URL=http://localhost:3000

# SEGURANÇA
JWT_SECRET=SUA_CHAVE_JWT_AQUI

# ARMAZENAMENTO LOCAL
STORAGE_PROVIDER=local
UPLOAD_DIRECTORY=/uploads
NEXT_PUBLIC_UPLOAD_STATIC_DIRECTORY=/uploads
```

### C. Arquivo `docker-compose.yaml`
Crie o arquivo `nano docker-compose.yaml`:
```yaml
services:
  postiz:
    image: ghcr.io/sr-satoru/superpostiz:latest
    container_name: superpostiz
    restart: always
    env_file:
      - .env
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postiz-postgres:5432/${POSTGRES_DB}
      - REDIS_URL=redis://postiz-redis:6379
    ports:
      - "127.0.0.1:5000:5000"
    volumes:
      - postiz-uploads:/uploads
      - postiz-config:/config
    depends_on:
      postiz-postgres:
        condition: service_healthy
      postiz-redis:
        condition: service_started
    networks:
      - postiz-network

  postiz-postgres:
    image: postgres:17-alpine
    container_name: superpostiz-postgres
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - postiz-network

  postiz-redis:
    image: redis:7-alpine
    container_name: superpostiz-redis
    restart: always
    volumes:
      - redis-data:/data
    networks:
      - postiz-network

volumes:
  postgres-data:
  redis-data:
  postiz-uploads:
  postiz-config:

networks:
  postiz-network:
    driver: bridge
```

---

## 🌐 3. Nginx Reverso no Host (VPS)

Crie o arquivo `/etc/nginx/sites-available/superpost.shop.conf`:
```nginx
server {
    listen 80;
    server_name superpost.shop www.superpost.shop;

    client_max_body_size 2G;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
```

Ative e gere o SSL:
```bash
sudo ln -sf /etc/nginx/sites-available/superpost.shop.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d superpost.shop -d www.superpost.shop
```

---

## 🛠️ 4. Comandos do Dia a Dia

| Ação | Comando |
| :--- | :--- |
| **Subir tudo** | `docker compose up -d` |
| **Ver logs em tempo real** | `docker compose logs -f superpostiz` |
| **Ver status dos containers** | `docker compose ps` |
| **Atualizar após novo commit** | `docker compose pull && docker compose up -d` |
| **Reiniciar containers** | `docker compose restart` |
| **Parar tudo** | `docker compose down` |
