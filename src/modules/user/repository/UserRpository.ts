import { pool } from "../../../mysql";
import { hash, compare } from 'bcrypt'
import { v4 as uuidv4} from 'uuid';
import {sign, verify} from 'jsonwebtoken'
import { Request,Response } from "express";


class UserRepository {

    create(request:Request , response:Response){
        const {name, email, password } = request.body;
        const user_id = uuidv4()

        pool.getConnection((err:any, connection:any) => ( 
            hash(password,10,(err,hash) => {
                if (err) {
                    return response.status(500).json(err);
                 }
                connection.query(
                    'INSERT INTO user (user_id, name, email, password) VALUES (?,?,?,?)',
                    [user_id , name, email, hash], 
                    (error:any , result:any, fileds:any) => {
                        connection.release()
                       if (error) {
                          return response.status(400).json(error);
                       }
                       response.status(200).json({massage:'Usuario criado com suceso'});
                    }
                )
            })
        ))  
    }



    login(request:Request , response:Response){
        const {email,password } = request.body;
        pool.getConnection((err:any, connection:any) => ( 
       
         connection.query(
            'SELECT * FROM user WHERE email = ?',
            [email], 
            (error:any , results:any, fileds:any) => {
            connection.release()
            if (error) {
                return response.status(400).json({error: "ERRO NA SUA AUTENTICAÇÃO!"});
            }
            compare(password,results[0].password, (err,result) => {
                if (err) {
                    return response.status(400).json({error: "ERRO NA SUA AUTENTICAÇÃO!"});
                }

                 if (result){
                     const token = sign({
                         id: results[0].user_id,
                         email: results[0].email
                     }, process.env.SECRET as string, {expiresIn: "1d"})

                     return response.status(200).json({token:token , massage:'Autemticação comcluida com suceso'});
                    }

            })
         }
        )
    ))
    }


    getUser(request: Request, response: Response) { 
        const token = request.headers && request.headers.authorization;
        if (!token) {
            return response.status(401).json({ message: 'Token não encontrado!' });
        }
        const decode:any = verify(token, process.env.SECRET as string);
        if (decode.email) {
            pool.getConnection((error, conn) => {
                conn.query(
                    'SELECT * FROM user WHERE email=?',
                    [decode.email],
                    (error, resultado, fields) => {
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
                    }
                );
            });
            
        }
    }

    update(request: Request, response: Response) { 
        const {name, email, password } = request.body;
        const token = request.headers && request.headers.authorization;
        if (!token) {
            return response.status(401).json({ message: 'Token não encontrado!' });
        }
        const decode:any = verify(token,process.env.SECRET as string);
        if (decode.id) {
            pool.getConnection((error, connection) => {
                hash(password,10,(err,hash) => {
                    if (err) {
                        return response.status(500).json(err);
                     }
                    connection.query(
                        'UPDATE user SET name = ?, email = ?, password = ? WHERE user_id = ?',
                        [name, email, hash, decode.id],
                        (error:any , result:any, fileds:any) => {
                            connection.release()
                           if (error) {
                              return response.status(400).json({error: "ERRO AO TETAR ATUALIZAR"});
                           }
                           response.status(200).json({massage:'Usuario atualizado com suceso'});
                        }
                    );
                })
            });           
        }
    }

    delete(request: Request, response: Response) {
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
              response.status(200).json({ message: 'Usuário deletado com sucesso' });
            }
            );
    
              connection.query(
                'DELETE FROM user WHERE user_id = ?',
                [decode.id],
                (error: any, result: any, fields: any) => {
                  connection.release();
                  if (error) {
                    return response.status(400).json(error);
                  }
                  response.status(200).json({ message: 'Usuário deletado com sucesso' });
                }
              );
            }
          );

        };
    }
}



export { UserRepository };