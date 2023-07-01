"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskRepository = void 0;
const mysql_1 = require("../../../mysql");
const uuid_1 = require("uuid");
const jsonwebtoken_1 = require("jsonwebtoken");
class TaskRepository {
    createTask(request, response) {
        const { title, description } = request.body;
        const token = request.headers && request.headers.authorization;
        if (!token) {
            return response.status(401).json({ message: 'Token não encontrado!' });
        }
        const decode = (0, jsonwebtoken_1.verify)(token, 'segredo');
        if (decode.id) {
            mysql_1.pool.getConnection((error, connection) => {
                const taskId = (0, uuid_1.v4)();
                connection.query('INSERT INTO tasks (tasks_id, title, description, user_user_id) VALUES (?,?,?,?)', [taskId, title, description, decode.id], (error, result, fields) => {
                    connection.release();
                    if (error) {
                        return response.status(400).json({ error: "ERRO" });
                    }
                    connection.query('SELECT * FROM tasks WHERE tasks_id = ? AND user_user_id = ?', [taskId, decode.id], (error, result, fields) => {
                        if (error) {
                            return response.status(400).json({ error: "ERRO" });
                        }
                        if (result.length === 0) {
                            return response.status(404).json({ error: "Tarefa não encontrada" });
                        }
                        const taskData = result[0];
                        response.status(200).json(taskData);
                    });
                });
            });
        }
    }
    updateTask(request, response) {
        const { title, description, taskId } = request.body;
        mysql_1.pool.getConnection((error, connection) => {
            connection.query('UPDATE tasks SET title = ?, description = ? WHERE tasks_id = ?', [title, description, taskId], (error, result, fields) => {
                connection.release();
                if (error) {
                    return response.status(400).json({ error: "ERRO" });
                }
                if (result.affectedRows === 0) {
                    return response.status(404).json({ error: "Tarefa não encontrada" });
                }
                response.status(200).json({ message: 'Task atualizada com sucesso' });
            });
        });
    }
    delete(request, response) {
        const { taskId } = request.body;
        mysql_1.pool.getConnection((err, connection) => {
            if (err) {
                return response.status(500).json(err);
            }
            connection.query('DELETE FROM tasks WHERE tasks_id = ?', [taskId], (error, result, fields) => {
                connection.release();
                if (error) {
                    return response.status(400).json(error);
                }
                response.status(200).json({ message: 'Tarefa deletado com sucesso' });
            });
        });
    }
    deleteAll(request, response) {
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
                    response.status(200).json({ message: 'Todas as tasks foram deletado com sucesso' });
                });
            });
        }
    }
}
exports.TaskRepository = TaskRepository;
