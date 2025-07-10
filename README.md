# 🥑 Links Abacate

Um encurtador de links moderno e elegante com dashboard completo de analytics.

![Links Abacate](https://img.shields.io/badge/Status-Ativo-green)
![Versão](https://img.shields.io/badge/Versão-1.0.0-blue)
![Licença](https://img.shields.io/badge/Licença-MIT-yellow)

## 🌐 Demo Online

**🚀 [Acesse o Links Abacate](https://links-abacate.vercel.app/)**

- **Página Principal**: https://links-abacate.vercel.app/
- **Dashboard**: https://links-abacate.vercel.app/dashboard

## ✨ Recursos

- **🔗 Encurtamento de URLs**: Transforme links longos em URLs curtas e amigáveis
- **📊 Dashboard Analytics**: Acompanhe cliques, origens e estatísticas detalhadas
- **⚡ Performance**: Interface rápida e responsiva
- **🎨 Design Moderno**: Interface limpa com CSS puro e Alpine.js
- **📱 Mobile-First**: Totalmente responsivo para todos os dispositivos
- **🔒 Seguro**: Validação de URLs e proteção contra ataques

## 🚀 Tecnologias Utilizadas

### Frontend
- **HTML5** - Estrutura semântica
- **CSS Puro** - Estilos modernos com variáveis CSS
- **Alpine.js** - Reatividade e interatividade
- **Chart.js** - Gráficos para analytics

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web minimalista
- **SQLite** - Banco de dados local
- **CORS** - Compartilhamento de recursos entre origens

## 📦 Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd links-abacate
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure o banco de dados**
   ```bash
   npm run setup
   ```

4. **Inicie o servidor**
   ```bash
   npm start
   ```

   Para desenvolvimento com auto-reload:
   ```bash
   npm run dev
   ```

5. **Acesse a aplicação**
   - **Homepage**: http://localhost:3000
   - **Dashboard**: http://localhost:3000/dashboard

## 🎯 Como Usar

### Encurtar um Link
1. Acesse a página principal
2. Cole sua URL no campo de entrada
3. Clique em "Encurtar"
4. Copie o link encurtado e compartilhe!

### Visualizar Analytics
1. Acesse o dashboard em `/dashboard`
2. Veja estatísticas gerais dos seus links
3. Analise gráficos de performance
4. Explore detalhes de cada link
5. Acompanhe origem dos cliques

## 📁 Estrutura do Projeto

```
links-abacate/
├── public/                 # Arquivos estáticos do frontend
│   ├── index.html         # Página principal
│   ├── dashboard.html     # Dashboard de analytics
│   ├── style.css          # Estilos CSS puros
│   └── app.js             # JavaScript com Alpine.js
├── server.js              # Servidor Express.js
├── setup.js               # Script de configuração do BD
├── package.json           # Dependências e scripts
├── links.db               # Banco de dados SQLite (criado automaticamente)
└── README.md              # Documentação
```

## 🔧 Scripts Disponíveis

- `npm start` - Inicia o servidor local com SQLite
- `npm run dev` - Inicia o servidor em modo desenvolvimento
- `npm run setup` - Configura o banco de dados SQLite local
- `npm run vercel-build` - Script de build para Vercel

## 🗄️ Banco de Dados

### Desenvolvimento Local
- **SQLite** - Banco local em arquivo `links.db`
- Dados persistentes entre reinicializações
- Execute `npm run setup` para criar tabelas iniciais

### Produção (Vercel)
- **Armazenamento em memória** - Dados temporários
- Recomendado migrar para banco externo (MongoDB, PostgreSQL)
- Dados são resetados a cada deploy

## 📊 API Endpoints

### POST `/api/shorten`
Encurta uma URL

**Request:**
```json
{
  "url": "https://exemplo.com/url-muito-longa"
}
```

**Response:**
```json
{
  "original_url": "https://exemplo.com/url-muito-longa",
  "short_url": "http://localhost:3000/abc123",
  "short_code": "abc123"
}
```

### GET `/api/stats`
Retorna estatísticas de todos os links

### GET `/api/stats/:shortCode`
Retorna estatísticas detalhadas de um link específico

### GET `/:shortCode`
Redireciona para a URL original e registra o clique

## 🎨 Personalização

### Cores
As cores podem ser personalizadas no arquivo `style.css` através das variáveis CSS:

```css
:root {
    --primary-color: #22c55e;    /* Verde principal */
    --primary-dark: #16a34a;     /* Verde escuro */
    --primary-light: #86efac;    /* Verde claro */
    /* ... outras variáveis */
}
```

### Funcionalidades
- Para adicionar novos recursos, edite `server.js` (backend) e `app.js` (frontend)
- Para modificar o design, edite `style.css`
- Para adicionar novas páginas, crie arquivos HTML em `public/`

## 🔒 Segurança

- Validação de URLs no lado servidor
- Sanitização de dados de entrada
- Proteção contra XSS
- CORS configurado apropriadamente
- Rate limiting recomendado para produção

## 🚀 Deploy

### Vercel (Recomendado)
O projeto já está configurado para deploy na Vercel:

1. **Conecte seu repositório** à Vercel
2. **Configure as variáveis de ambiente** (se necessário)
3. **Deploy automático** a cada push na branch main

**Site em produção**: [https://links-abacate.vercel.app/](https://links-abacate.vercel.app/)

### Outros Provedores

#### Heroku
1. Configure as variáveis de ambiente
2. Use o buildpack do Node.js
3. Configure o `PORT` conforme necessário

#### VPS/Servidor
1. Configure Node.js no servidor
2. Use PM2 para gerenciamento de processos
3. Configure um proxy reverso (Nginx)
4. Configure HTTPS com certificado SSL

## 🐛 Troubleshooting

### Banco de dados não criado
```bash
rm links.db
npm run setup
```

### Porta em uso
Altere a porta no `server.js` ou configure a variável de ambiente `PORT`:
```bash
PORT=8080 npm start
```

### Problemas com dependências
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**PachiCodes**
- GitHub: [@pachicodes](https://github.com/pachicodes)

## 🙏 Agradecimentos

- Inspirado por serviços como bit.ly e tinyurl
- Ícones de emoji para uma interface amigável
- Comunidade open source pelas ferramentas incríveis

---

Feito com 💚 e muito ☕ por PachiCodes
