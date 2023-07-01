"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const mysql_1 = require("../../../mysql");
const bcrypt_1 = require("bcrypt");
const uuid_1 = require("uuid");
const jsonwebtoken_1 = require("jsonwebtoken");
class UserRepository {
    create(request, response) {
        const { name, email, password } = request.body;
        const user_id = (0, uuid_1.v4)();
        mysql_1.pool.getConnection((err, connection) => ((0, bcrypt_1.hash)(password, 10, (err, hash) => {
            if (err) {
                return response.status(500).json(err);
            }
            connection.query('INSERT INTO user (user_id, name, email, password) VALUES (?,?,?,?)', [user_id, name, email, hash], (error, result, fileds) => {
                connection.release();
                if (error) {
                    return response.status(400).json(error);
                }
                response.status(200).json({ massage: 'Usuario criado com suceso' });
            });
        })));
    }
    login(request, response) {
        const { email, password } = request.body;
        mysql_1.pool.getConnection((err, connection) => (connection.query('SELECT * FROM user WHERE email = ?', [email], (error, results, fileds) => {
            connection.release();
            if (error) {
                return response.status(400).json({ error: "ERRO NA SUA AUTENTICAÇÃO!" });
            }
            (0, bcrypt_1.compare)(password, results[0].password, (err, result) => {
                if (err) {
                    return response.status(400).json({ error: "ERRO NA SUA AUTENTICAÇÃO!" });
                }
                if (result) {
                    const token = (0, jsonwebtoken_1.sign)({
                        id: results[0].user_id,
                        email: results[0].email
                    }, process.env.SECRET, { expiresIn: "1d" });
                    return response.status(200).json({ token: token, massage: 'Autemticação comcluida com suceso' });
                }
            });
        })));
    }
    getUser(request, response) {
        const token = request.headers && request.headers.authorization;
        if (!token) {
            return response.status(401).json({ message: 'Token não encontrado!' });
        }
        const decode = (0, jsonwebtoken_1.verify)(token, process.env.SECRET);
        if (decode.email) {
            mysql_1.pool.getConnection((error, conn) => {
                conn.query('SELECT * FROM user WHERE email=?', [decode.email], (error, resultado, fields) => {
                    conn.release();
                    if (resultado.length === 0) {
                        return response.status(404).send({ message: 'Usuário não encontrado' });
                    }
                    if (error) {
                        return response.status(400).send({
                            error: error,
                            response: null
                        });
                    }
                    return response.status(200).send({
                        user: {
                            nome: resultado[0].name,
                            email: resultado[0].email,
                            id: resultado[0].user_id,
                        }
                    });
                });
            });
        }
    }
    update(request, response) {
        const { name, email, password } = request.body;
        const token = request.headers && request.headers.authorization;
        if (!token) {
            return response.status(401).json({ message: 'Token não encontrado!' });
        }
        const decode = (0, jsonwebtoken_1.verify)(token, process.env.SECRET);
        if (decode.id) {
            mysql_1.pool.getConnection((error, connection) => {
                (0, bcrypt_1.hash)(password, 10, (err, hash) => {
                    if (err) {
                        return response.status(500).json(err);
                    }
                    connection.query('UPDATE user SET name = ?, email = ?, password = ? WHERE user_id = ?', [name, email, hash, decode.id], (error, result, fileds) => {
                        connection.release();
                        if (error) {
                            return response.status(400).json({ error: "ERRO AO TETAR ATUALIZAR" });
                        }
                        response.status(200).json({ massage: 'Usuario atualizado com suceso' });
                    });
                });
            });
        }
    }
    delete(request, response) {
        const token = request.headers && request.headers.authorization;
        if (!token) {
            return response.status(401).json({ message: 'Token não encontrado!' });
        }
        const decode = (0, jsonwebtoken_1.verify)(token, process.env.SECRET);
        if (decode.id) {
            mysql_1.pool.getConnection((err, connection) => {
                if (err) {
                    return response.status(500).json(err);
                }
                connection.query('DELETE FROM tasks WHERE user_user_id = ?', [decode.id], (error, result, fields) => {
                    connection.release();
                    if (error) {
                        return response.status(400).json(error);
                    }
                    response.status(200).json({ message: 'Usuário deletado com sucesso' });
                });
                connection.query('DELETE FROM user WHERE user_id = ?', [decode.id], (error, result, fields) => {
                    connection.release();
                    if (error) {
                        return response.status(400).json(error);
                    }
                    response.status(200).json({ message: 'Usuário deletado com sucesso' });
                });
            });
        }
        ;
    }
}
exports.UserRepository = UserRepository;
