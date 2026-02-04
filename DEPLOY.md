# Guia de Deploy - NGINX no Ubuntu

Siga estes passos exatos no seu servidor VPS para configurar o Nginx.

## 1. Instalar Nginx e Certbot (se ainda não tiver)
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y
```

## 2. Copiar a configuração
Rode este comando (assumindo que você está na pasta do projeto onde o arquivo `superpostiz.nginx.conf` foi criado):

```bash
sudo cp superpostiz.nginx.conf /etc/nginx/sites-available/superpostiz
```

## 3. Ativar o site
Crie um link simbólico para a pasta `sites-enabled`:

```bash
sudo ln -s /etc/nginx/sites-available/superpostiz /etc/nginx/sites-enabled/
```

## 4. Testar e Reiniciar o Nginx
Verifique se a configuração está válida:
```bash
sudo nginx -t
```
Se der "syntax is ok", reinicie o serviço:
```bash
sudo systemctl restart nginx
```

## 5. Configurar HTTPS (SSL Gratuito)
Use o certbot para configurar o SSL automaticamente para o seu domínio:

```bash
sudo certbot --nginx -d superpostiz.shop
```

---

## Lembre-se
1. Certifique-se de que o PM2 já está rodando sua aplicação nas portas 3000 (backend) e 4200 (frontend).
   ```bash
   pm2 list
   ```
2. **Importante**: No seu arquivo `.env`, certifique-se de que as variáveis de URL estão corretas para este novo modelo de rota:
   ```env
   FRONTEND_URL="https://superpostiz.shop"
   NEXT_PUBLIC_BACKEND_URL="https://superpostiz.shop/api"
   ```
