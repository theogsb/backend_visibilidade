import { UserService } from '../../src/services/userServices.js';
import { UserModel } from '../../src/models/models.js';

jest.mock('../../src/models/models.js');

describe('UserService - getUser', () => {
 let userService;


 beforeEach(() => {
   userService = new UserService();
   jest.clearAllMocks();
 });

 it('deve retornar o usuário quando ele existe no banco de dados', async () => {
   const mockUser = { _id: '123', name: 'John Doe', email: 'john@example.com' };
   UserModel.findById.mockResolvedValue(mockUser);


   const userId = '123';
   const user = await userService.getUser(userId);


   expect(user).toEqual(mockUser);
   expect(UserModel.findById).toHaveBeenCalledWith(userId);
 });

 it('deve lançar um erro quando o usuário não é encontrado', async () => {
   UserModel.findById.mockResolvedValue(null);

   const userId = '456';
   await expect(userService.getUser(userId)).rejects.toThrow('Usuário não encontrado!');

   expect(UserModel.findById).toHaveBeenCalledWith(userId);
 });

 it('deve lançar um erro quando ocorre um problema no banco de dados', async () => {
   const mockError = new Error('Erro no banco de dados');
   UserModel.findById.mockRejectedValue(mockError);

   const userId = '789';
   await expect(userService.getUser(userId)).rejects.toThrow('Erro no banco de dados');

   expect(UserModel.findById).toHaveBeenCalledWith(userId);
 });
});
