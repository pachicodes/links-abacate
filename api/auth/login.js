const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

// Configurações
const JWT_SECRET = process.env.JWT_SECRET || 'links-abacate-super-secret-key-2024';
const DB_PATH = path.join('/tmp', 'links.db');

// Função para conectar com banco
function connectDatabase() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Erro ao conectar com banco:', err);
                reject(err);
            } else {
                resolve(db);
            }
        });
    });
}

// Função para validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// API Handler
module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ erro: 'Método não permitido' });
    }

    let db = null;

    try {
        const { email, senha, lembrarMe } = req.body;

        // Validações
        if (!email || !senha) {
            return res.status(400).json({ 
                erro: 'Email e senha são obrigatórios' 
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ 
                erro: 'Email inválido' 
            });
        }

        // Conectar com banco
        db = await connectDatabase();

        // Buscar usuário por email
        const user = await new Promise((resolve, reject) => {
            db.get(
                `SELECT id, nome, email, password_hash, created_at 
                 FROM users WHERE email = ?`,
                [email.toLowerCase().trim()],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!user) {
            db.close();
            return res.status(401).json({ 
                erro: 'Email ou senha incorretos' 
            });
        }

        // Verificar senha
        const senhaValida = await bcrypt.compare(senha, user.password_hash);

        if (!senhaValida) {
            db.close();
            return res.status(401).json({ 
                erro: 'Email ou senha incorretos' 
            });
        }

        // Fechar conexão
        db.close();

        // Gerar token JWT
        const expiresIn = lembrarMe ? '30d' : '7d'; // 30 dias se "lembrar de mim"
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                nome: user.nome
            },
            JWT_SECRET,
            { expiresIn }
        );

        console.log(`Login realizado: ${user.email} (ID: ${user.id})`);

        res.status(200).json({
            sucesso: true,
            mensagem: 'Login realizado com sucesso!',
            usuario: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                created_at: user.created_at
            },
            token: token,
            expiresIn: expiresIn
        });

    } catch (error) {
        console.error('Erro no login:', error);
        
        // Fechar conexão se ainda estiver aberta
        if (db && db.open) {
            db.close();
        }

        res.status(500).json({ 
            erro: 'Erro interno do servidor. Tente novamente.' 
        });
    }
};
