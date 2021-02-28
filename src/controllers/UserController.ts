import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import * as yup from "yup";
import { AppError } from "../errors/AppError";

import { UserRepository } from "../repositories/UserRepository";

class UserController {
  async create(req: Request, res: Response) {
    const { name, email } = req.body;

    const schema = yup.object().shape({
      name: yup.string().required("Nome é obrigatório"),
      email: yup
        .string()
        .email("E-mail incorreto")
        .required("E-mail é obrigatório"),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (err) {
      return res.status(400).json({ error: err });
    }

    const usersRepository = getCustomRepository(UserRepository);

    const userAlreadyExists = await usersRepository.findOne({ email });

    if (userAlreadyExists) {
      throw new AppError("User already exists!");
    }

    const user = usersRepository.create({ name, email });

    await usersRepository.save(user);

    return res.status(201).json(user);
  }
}

export { UserController };
