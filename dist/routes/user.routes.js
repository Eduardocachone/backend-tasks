"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const login_1 = require("../middleware/login");
const express_1 = require("express");
const UserRpository_1 = require("../modules/user/repository/UserRpository");
const userRouter = (0, express_1.Router)();
exports.userRouter = userRouter;
const userRepository = new UserRpository_1.UserRepository();
userRouter.post('/sign-up', (request, response) => {
    userRepository.create(request, response);
});
userRouter.post('/sign-in', (request, response) => {
    userRepository.login(request, response);
});
userRouter.get('/get-user', login_1.login, (request, response) => {
    userRepository.getUser(request, response);
});
userRouter.put('/update', login_1.login, (request, response) => {
    userRepository.update(request, response);
});
userRouter.delete('/delete', login_1.login, (request, response) => {
    userRepository.delete(request, response);
});
