// Função serverless para servir páginas estáticas
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
    try {
        const { slug } = req.query;
        
        // Se for uma rota de API, retornar erro
        if (req.url.startsWith('/api/')) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(404).json({ error: 'API route not found' });
        }
        
        // Se for um arquivo estático, ignorar
        if (req.url.includes('.')) {
            return res.status(404).send('File not found');
        }
        
        // Servir páginas HTML
        let filePath;
        
        if (!slug || slug.length === 0 || slug[0] === '') {
            // Página principal
            filePath = path.join(process.cwd(), 'public', 'index.html');
        } else if (slug[0] === 'dashboard') {
            // Dashboard
            filePath = path.join(process.cwd(), 'public', 'dashboard.html');
        } else {
            // Código de redirecionamento - por enquanto redirecionar para página principal
            // Em produção, implementar lógica de redirecionamento
            return res.redirect('/');
        }
        
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            res.setHeader('Content-Type', 'text/html');
            return res.status(200).send(content);
        } else {
            return res.status(404).send('Page not found');
        }
        
    } catch (error) {
        console.error('Erro ao servir página:', error);
        return res.status(500).send('Internal server error');
    }
};
