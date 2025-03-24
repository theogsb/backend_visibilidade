import { UserService } from "../services/userServices.js";

const handleError = (res, error) => {
  res.status(500).json({
    success: false,
    message: error.message
  });
};

export class UserController {
  constructor() {
    this.service = new (UserService);
  }

  async createUser(req, res) {
    try {
      const { user, schedule } = await this.service.createUser(req.body);
      const { userId , posts } = schedule;

      res.status(200).json({
        success: true,
        message: "Usuário Validado com sucesso",
        data: user,
        shedule: {userId , posts}
      });

    } catch (error) {
        if (error.message === "Dados inválidos retornados pela API externa") {
          res.status(400).json({
            success: false,
            message: error.message
          });
        }
      
        else {
          handleError(res, error);
      }
    }
  }

  async getUser(req, res) {
    try {
      const response = await this.service.getUser(req.params.userId);

      res.status(200).json({
        success: true,
        message: "Usuário enviado com sucesso!",
        data: response
      });

    } catch( error ) {
      handleError(res, error);
    }
  }

  async updateUser(req, res) {
    try {
      const response = await this.service.updateUser(req.params.userId , req.body);

      res.status(200).json({
        sucess: true,
        message: "Usuário Atualizado com sucesso!",
        data: response
      })

    }catch(error) {
      handleError(res, error);
    }
  }

}
