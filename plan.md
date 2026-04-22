# Plano da API Pública de Automação

Este documento detalha os endpoints da API pública para gerenciamento de automações.

## 🔍 Consultas (v1) - Read Only

### Buscar IDs das Automações
`GET` `https://www.superpostiz.shop/api/public/v1/automations/ids`

### Buscar uma Automação Específica
`GET` `https://www.superpostiz.shop/api/public/v1/automations/{id}`

### Buscar os Horários da Automação
`GET` `https://www.superpostiz.shop/api/public/v1/automations/schedule/{id}`

---

## ✍️ Ações (v2) - Write Operations

### Criar uma Nova Automação
`POST` `https://www.superpostiz.shop/api/public/v2/new/automation`

### Configurar Horários Iniciais
`POST` `https://www.superpostiz.shop/api/public/v2/automations/schedule/{id}`

### Atualizar Horários e Dias da Semana
`PATCH` `https://www.superpostiz.shop/api/public/v2/automations/schedule/{id}`

### Associar Mídias ao Template
`POST` `https://www.superpostiz.shop/api/public/v2/automations/media/{id}`

### Associar Integrações ao Template
`POST` `https://www.superpostiz.shop/api/public/v2/automations/integrations/{id}`

---

## 🚀 Exemplos de Uso

### 1. Listar IDs de Automações
Útil para obter o `{id}` necessário para os outros endpoints.

#### 🌐 JavaScript (Fetch)
```javascript
const apiKey = 'SUA_API_KEY';

fetch('https://www.superpostiz.shop/api/public/v1/automations/ids', {
  method: 'GET',
  headers: { 
    'x-api-key': apiKey,
    'Accept': 'application/json'
  }
})
.then(res => res.json())
.then(console.log)
.catch(console.error);
```

#### 🐍 Python (Requests)
```python
import requests

api_key = 'SUA_API_KEY'
url = 'https://www.superpostiz.shop/api/public/v1/automations/ids'
headers = {'x-api-key': api_key}

try:
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    print(response.json())
except Exception as e:
    print(f"Erro: {e}")
```

### 2. Criar Nova Automação
Cria o "shell" da automação para ser configurado posteriormente.

#### 🌐 JavaScript (Fetch)
```javascript
const payload = { name: "Campanha de Lançamento" };

fetch('https://www.superpostiz.shop/api/public/v2/new/automation', {
  method: 'POST',
  headers: { 
    'x-api-key': 'SUA_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
})
.then(res => res.json())
.then(data => console.log(`Automação criada ID: ${data.id}`));
```

#### 🐍 Python (Requests)
```python
import requests

url = 'https://www.superpostiz.shop/api/public/v2/new/automation'
headers = {'x-api-key': 'SUA_API_KEY'}
payload = {"name": "Campanha de Lançamento"}

response = requests.post(url, json=payload, headers=headers)
print(response.json())
```

### 3. Configurar/Atualizar Horários
Define em quais dias e horas a automação deve disparar.

#### 🌐 JavaScript (Fetch - PATCH)
```javascript
const automationId = 'SEU_ID_AQUI';
const config = {
  timeSlots: ["09:00", "14:30", "20:00"],
  daysOfWeek: [1, 3, 5], // Seg, Qua, Sex
  storyTimeSlots: ["12:00"]
};

fetch(`https://www.superpostiz.shop/api/public/v2/automations/schedule/${automationId}`, {
  method: 'PATCH',
  headers: { 
    'x-api-key': 'SUA_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(config)
})
.then(res => res.json());
```

#### 🐍 Python (Requests - PATCH)
```python
import requests

automation_id = 'SEU_ID_AQUI'
url = f'https://www.superpostiz.shop/api/public/v2/automations/schedule/{automation_id}'
headers = {'x-api-key': 'SUA_API_KEY'}

config = {
    "timeSlots": ["09:00", "14:30", "20:00"],
    "daysOfWeek": [1, 3, 5]
}

response = requests.patch(url, json=config, headers=headers)
print(response.json())
```

### 4. Associar Recursos (Mídias e Integrações)
Define o que será postado e em quais redes sociais.

#### 🖼️ Associar Mídias (JS)
```javascript
const mediaArr = {
  media: [
    { id: "media-uuid-1", postType: null },
    { id: "media-uuid-2", postType: "story" }
  ]
};

fetch('https://www.superpostiz.shop/api/public/v2/automations/media/ID_AQUI', {
  method: 'POST',
  headers: { 'x-api-key': 'SUA_API_KEY', 'Content-Type': 'application/json' },
  body: JSON.stringify(mediaArr)
});
```

#### 🔗 Associar Canais (Python)
```python
import requests

data = {
    "integrationIds": ["canal-fb-id", "canal-ig-id"]
}
url = 'https://www.superpostiz.shop/api/public/v2/automations/integrations/ID_AQUI'
headers = {'x-api-key': 'SUA_API_KEY'}

response = requests.post(url, json=data, headers=headers)
print(response.json())
```