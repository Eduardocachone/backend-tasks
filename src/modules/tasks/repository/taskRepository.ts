import { pool } from "../../../mysql";
import { v4 as uuidv4} from 'uuid';
import {sign, verify} from 'jsonwebtoken'
import { Request,Response } from "express";



class TaskRepository {
    createTask(request: Request, response: Response) {
        const { title, description } = request.body;
        const token = request.headers && request.headers.authorization;
        if (!token) {
          return response.status(401).json({ message: 'Token não encontrado!' });
        }
        const decode: any = verify(token, 'segredo' as string);
        if (decode.id) {
          pool.getConnection((error, connection) => {
            const taskId = uuidv4();
      
            connection.query(
              'INSERT INTO tasks (tasks_id, title, description, user_user_id) VALUES (?,?,?,?)',
              [taskId, title, description, decode.id],
              (error: any, result: any, fields: any) => {
                connection.release();
                if (error) {
                  return response.status(400).json({ error: "ERRO" });
                }
      
                connection.query(
                  'SELECT * FROM tasks WHERE tasks_id = ? AND user_user_id = ?',
                  [taskId, decode.id],
                  (error: any, result: any, fields: any) => {
                    if (error) {
                      return response.status(400).json({ error: "ERRO" });
                    }
                    if (result.length === 0) {
                      return response.status(404).json({ error: "Tarefa não encontrada" });
                    }
                    const taskData = result[0];
                    response.status(200).json(taskData);
                  }
                );
              }
            );
          });
        }
      }

    updateTask(request: Request, response: Response) {
        const { title, description,taskId } = request.body;

          pool.getConnection((error, connection) => {
            connection.query(
              'UPDATE tasks SET title = ?, description = ? WHERE tasks_id = ?',
              [title, description, taskId],
              (error: any, result: any, fields: any) => {
                connection.release();
                if (error) {
                  return response.status(400).json({ error: "ERRO" });
                }
                if (result.affectedRows === 0) {
                  return response.status(404).json({ error: "Tarefa não encontrada" });
                }
                response.status(200).json({ message: 'Task atualizada com sucesso' });
              }
            );
        });
    }

    delete(request: Request, response: Response) {
        const {taskId} = request.body;
           
            pool.getConnection((err: any, connection: any) => {
              if (err) {
                return response.status(500).json(err);
              }
          
              connection.query(
                'DELETE FROM tasks WHERE tasks_id = ?',
                [taskId],
                (error: any, result: any, fields: any) => {
                  connection.release();
                  if (error) {
                    return response.status(400).json(error);
                  }
                  response.status(200).json({ message: 'Tarefa deletado com sucesso' });
                }
              );
            });
          
        }



        deleteAll(request: Request, response: Response) {
          const token = request.headers && request.headers.authorization;
          if (!token) {
              return response.status(401).json({ message: 'Token não encontrado!' });
          }
          const decode:any = verify(token, process.env.SECRET as string);
          if (decode.id) {
          pool.getConnection((err: any, connection: any) => {
            if (err) {
              return response.status(500).json(err);
            }
        
            connection.query(
              'DELETE FROM tasks WHERE user_user_id = ?',
              [decode.id],
              (error: any, result: any, fields: any) => {
                connection.release();
                if (error) {
                  return response.status(400).json(error);
                }
                response.status(200).json({ message: 'Todas as tasks foram deletado com sucesso' });
              }
              );
            });
          }
        }
  
}

      

export {TaskRepository}

