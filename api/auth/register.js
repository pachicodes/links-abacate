const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

// Configurações
const JWT_SECRET = process.env.JWT_SECRET || 'links-abacate-super-secret-key-2024';
const DB_PATH = path.join('/tmp', 'links.db');

// Função para inicializar banco de dados
function initDatabase() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Erro ao conectar com banco:', err);
                reject(err);
                return;
            }

            // Criar tabela de usuários se não existir
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) {
                    console.error('Erro ao criar tabela users:', err);
                    reject(err);
                } else {
                    console.log('Tabela users criada/verificada com sucesso');
                    resolve(db);
                }
            });
        });
    });
}

// Função para validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Função para validar senha
function isValidPassword(password) {
    return password && password.length >= 6;
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

    try {
        const { nome, email, senha } = req.body;

        // Validações
        if (!nome || !email || !senha) {
            return res.status(400).json({ 
                erro: 'Nome, email e senha são obrigatórios' 
            });
        }

        if (nome.trim().length < 2) {
            return res.status(400).json({ 
                erro: 'Nome deve ter pelo menos 2 caracteres' 
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ 
                erro: 'Email inválido' 
            });
        }

        if (!isValidPassword(senha)) {
            return res.status(400).json({ 
                erro: 'Senha deve ter pelo menos 6 caracteres' 
            });
        }

        // Conectar com banco
        const db = await initDatabase();

        // Verificar se email já existe
        const existingUser = await new Promise((resolve, reject) => {
            db.get(
                'SELECT id FROM users WHERE email = ?',
                [email.toLowerCase().trim()],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (existingUser) {
            db.close();
            return res.status(400).json({ 
                erro: 'Este email já está cadastrado' 
            });
        }

        // Hash da senha
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(senha, saltRounds);

        // Inserir usuário
        const userId = await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO users (nome, email, password_hash) 
                 VALUES (?, ?, ?)`,
                [nome.trim(), email.toLowerCase().trim(), passwordHash],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                }
            );
        });

        // Fechar conexão
        db.close();

        // Gerar token JWT
        const token = jwt.sign(
            { 
                userId: userId, 
                email: email.toLowerCase().trim(),
                nome: nome.trim()
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log(`Usuário registrado: ${email} (ID: ${userId})`);

        res.status(201).json({
            sucesso: true,
            mensagem: 'Conta criada com sucesso!',
            usuario: {
                id: userId,
                nome: nome.trim(),
                email: email.toLowerCase().trim()
            },
            token: token
        });

    } catch (error) {
        console.error('Erro no registro:', error);
        
        // Fechar conexão se ainda estiver aberta
        if (db && db.open) {
            db.close();
        }

        res.status(500).json({ 
            erro: 'Erro interno do servidor. Tente novamente.' 
        });
    }
};
