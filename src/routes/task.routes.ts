import { login } from "../middleware/login";
import { Router, request, response } from "express";
import { TaskRepository } from '../modules/tasks/repository/taskRepository'

const taskRouter = Router()
const taskRepository = new TaskRepository();

taskRouter.post('/create/task', login, (request , response) => {
    taskRepository.createTask(request,response)
})

taskRouter.put('/update/task', (request , response) => {
    taskRepository.updateTask(request,response)
})

taskRouter.delete('/delete/task', (request , response) => {
    taskRepository.delete(request,response)
})

taskRouter.delete('/deleteAll/task', login, (request , response) => {
    taskRepository.deleteAll(request,response)
})

export { taskRouter }