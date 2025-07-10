const jwt = require('jsonwebtoken');

// Configurações
const JWT_SECRET = process.env.JWT_SECRET || 'links-abacate-super-secret-key-2024';

// Middleware de autenticação
function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ erro: 'Token não fornecido' });
        }

        const token = authHeader.substring(7); // Remove "Bearer "
        
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        
        next();
    } catch (error) {
        console.error('Erro na verificação do token:', error);
        return res.status(401).json({ erro: 'Token inválido' });
    }
}

// API Handler para verificar status de autenticação
module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ erro: 'Método não permitido' });
    }

    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                autenticado: false,
                erro: 'Token não fornecido' 
            });
        }

        const token = authHeader.substring(7); // Remove "Bearer "
        
        const decoded = jwt.verify(token, JWT_SECRET);
        
        res.status(200).json({
            autenticado: true,
            usuario: {
                id: decoded.userId,
                nome: decoded.nome,
                email: decoded.email
            }
        });

    } catch (error) {
        console.error('Erro na verificação do token:', error);
        res.status(401).json({ 
            autenticado: false,
            erro: 'Token inválido' 
        });
    }
};

// Exportar também o middleware
module.exports.authMiddleware = authMiddleware;
