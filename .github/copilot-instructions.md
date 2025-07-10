<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Links Abacate - Copilot Instructions

## Contexto do Projeto
Este é um encurtador de links chamado "Links Abacate" desenvolvido com:
- **Frontend**: HTML puro, CSS puro, Alpine.js
- **Backend**: Node.js com Express.js
- **Banco de dados**: SQLite
- **Analytics**: Chart.js para visualizações

## Diretrizes de Desenvolvimento

### Frontend
- Use CSS puro com variáveis CSS para consistência
- Utilize Alpine.js para reatividade sem frameworks pesados
- Mantenha o design responsivo e acessível
- Siga a paleta de cores definida nas variáveis CSS (verde primary: #22c55e)
- Use emojis nos ícones para manter a leveza visual

### Backend
- Mantenha a API RESTful simples e clara
- Use SQLite para persistência local
- Implemente validação adequada nas rotas
- Registre analytics de cliques com informações do usuário

### Estilo de Código
- Use nomes de variáveis e funções em português para consistência
- Mantenha comentários explicativos em português
- Siga as convenções do JavaScript moderno (ES6+)
- Mantenha funções pequenas e focadas

### Estrutura
- `public/` contém todos os arquivos frontend
- `server.js` é o ponto de entrada do backend
- `setup.js` configura o banco de dados inicial
- Mantenha a separação clara entre frontend e backend

### Features Principais
- Encurtamento de URLs com códigos aleatórios
- Dashboard com estatísticas completas
- Sistema de analytics por clique
- Interface moderna e responsiva
- Funcionalidade de copiar links

Ao sugerir melhorias ou correções, mantenha a simplicidade e performance como prioridades.
