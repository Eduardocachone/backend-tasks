"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskRouter = void 0;
const login_1 = require("../middleware/login");
const express_1 = require("express");
const taskRepository_1 = require("../modules/tasks/repository/taskRepository");
const taskRouter = (0, express_1.Router)();
exports.taskRouter = taskRouter;
const taskRepository = new taskRepository_1.TaskRepository();
taskRouter.post('/create/task', login_1.login, (request, response) => {
    taskRepository.createTask(request, response);
});
taskRouter.put('/update/task', (request, response) => {
    taskRepository.updateTask(request, response);
});
taskRouter.delete('/delete/task', (request, response) => {
    taskRepository.delete(request, response);
});
taskRouter.delete('/deleteAll/task', login_1.login, (request, response) => {
    taskRepository.deleteAll(request, response);
});
