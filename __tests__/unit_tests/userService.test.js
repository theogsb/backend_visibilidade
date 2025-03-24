import { UserService } from '../../src/services/userServices.js';
import { UserModel, ScheduleModel } from '../../src/models/models.js';

jest.mock('../../src/models/models.js');

global.fetch = jest.fn();

describe('UserService', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
    global.fetch.mockClear();
    UserModel.findById.mockClear();
    UserModel.findByIdAndUpdate.mockClear();
    UserModel.findOne.mockClear();
    UserModel.prototype.save.mockClear();
    ScheduleModel.prototype.save.mockClear();
    ScheduleModel.findOne.mockClear();
  });

  describe('getUser', () => {
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

  describe('updateUser', () => {
    it('deve atualizar o usuário quando ele existe no banco de dados', async () => {
      const mockUser = { _id: '123', name: 'John Doe', email: 'john@example.com' };
      const updateData = { name: 'Jane Doe' };
      const updatedUser = { ...mockUser, ...updateData };

      UserModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

      const userId = '123';
      const user = await userService.updateUser(userId, updateData);

      expect(user).toEqual(updatedUser);
      expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { $set: updateData },
        { new: true }
      );
    });

    it('deve lançar um erro quando o usuário não é encontrado', async () => {
      UserModel.findByIdAndUpdate.mockResolvedValue(null);

      const userId = '456';
      const updateData = { name: 'Jane Doe' };

      await expect(userService.updateUser(userId, updateData)).rejects.toThrow('Usuário não encontrado!');

      expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { $set: updateData },
        { new: true }
      );
    });

    it('deve lançar um erro quando ocorre um problema no banco de dados', async () => {
      const mockError = new Error('Erro no banco de dados');
      UserModel.findByIdAndUpdate.mockRejectedValue(mockError);

      const userId = '789';
      const updateData = { name: 'Jane Doe' };

      await expect(userService.updateUser(userId, updateData)).rejects.toThrow('Erro no banco de dados');

      expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { $set: updateData },
        { new: true }
      );
    });

    it('deve atualizar campos aninhados corretamente', async () => {
      const mockUser = { _id: '123', name: 'John Doe', address: { city: 'New York', zip: '10001' } };
      const updateData = { address: { city: 'Los Angeles' } };
      const updatedUser = { ...mockUser, address: { ...mockUser.address, ...updateData.address } };

      UserModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

      const userId = '123';
      const user = await userService.updateUser(userId, updateData);

      expect(user).toEqual(updatedUser);
      expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { $set: { 'address.city': 'Los Angeles' } },
        { new: true }
      );
    });

    it('deve atualizar campos que são arrays corretamente', async () => {
      const mockUser = { _id: '123', name: 'John Doe', hobbies: ['reading', 'swimming'] };
      const updateData = { hobbies: ['reading', 'cycling'] };
      const updatedUser = { ...mockUser, hobbies: updateData.hobbies };

      UserModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

      const userId = '123';
      const user = await userService.updateUser(userId, updateData);

      expect(user).toEqual(updatedUser);
      expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { $set: { hobbies: ['reading', 'cycling'] } },
        { new: true }
      );
    });

    it('deve ignorar campos com valores indefinidos', async () => {
      const mockUser = { _id: '123', name: 'John Doe', age: 30 };
      const updateData = { age: undefined };
      const updatedUser = { ...mockUser };

      UserModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

      const userId = '123';
      const user = await userService.updateUser(userId, updateData);

      expect(user).toEqual(updatedUser);
      expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { $set: {} },
        { new: true }
      );
    });
  });

    //describe('createUser', () => {
    // it('deve criar um novo usuário e um novo agendamento quando o usuário não existe', async () => {
    //   const apiResponse = {
    //     user: { id: 1, name: 'John Doe' },
    //     ngo: { id: 123, name: 'ONG Example' },
    //   };
    //   global.fetch.mockResolvedValueOnce({
    //     json: jest.fn().mockResolvedValueOnce(apiResponse),
    //   });

    //   UserModel.findOne.mockResolvedValueOnce(null);

    //   const newUser = { _id: 'user123', user: apiResponse.user, ngo: apiResponse.ngo };
    //   UserModel.prototype.save.mockResolvedValueOnce(newUser);

    //   const newSchedule = { _id: 'schedule123', userId: 'user123', posts: [] };
    //   ScheduleModel.prototype.save.mockResolvedValueOnce(newSchedule);

    //   const userData = { email: 'john@example.com', password: 'password123' };

    //   const result = await userService.createUser(userData);

    //   expect(result).toEqual({ user: newUser, schedule: newSchedule });
    //   expect(global.fetch).toHaveBeenCalledWith(
    //     'https://bora-impactar-prd.setd.rdmapps.com.br/api/login.json',
    //     {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify(userData),
    //     }
    //   );
    //   expect(UserModel.findOne).toHaveBeenCalledWith({ 'ngo.id': apiResponse.ngo.id });
    //   expect(UserModel.prototype.save).toHaveBeenCalled();
    //   expect(ScheduleModel.prototype.save).toHaveBeenCalled();
    // });

    it('deve retornar um usuário existente e seu agendamento quando o usuário já está cadastrado', async () => {
      const apiResponse = {
        user: { id: 1, name: 'John Doe' },
        ngo: { id: 123, name: 'ONG Example' },
      };
      global.fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(apiResponse),
      });

      const existingUser = { _id: 'user123', user: apiResponse.user, ngo: apiResponse.ngo };
      UserModel.findOne.mockResolvedValueOnce(existingUser);

      const existingSchedule = { _id: 'schedule123', userId: 'user123', posts: [] };
      ScheduleModel.findOne.mockResolvedValueOnce(existingSchedule);

      const userData = { email: 'john@example.com', password: 'password123' };

      const result = await userService.createUser(userData);

      expect(result).toEqual({ user: existingUser, schedule: existingSchedule });
      expect(global.fetch).toHaveBeenCalledWith(
        'https://bora-impactar-prd.setd.rdmapps.com.br/api/login.json',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        }
      );
      expect(UserModel.findOne).toHaveBeenCalledWith({ 'ngo.id': apiResponse.ngo.id });
      expect(ScheduleModel.findOne).toHaveBeenCalledWith({ userId: existingUser._id });
    });

    it('deve lançar um erro quando a API externa retorna dados inválidos', async () => {
      const apiResponse = { user: null, ngo: null };
      global.fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(apiResponse),
      });

      const userData = { email: 'john@example.com', password: 'password123' };

      await expect(userService.createUser(userData)).rejects.toThrow('Dados inválidos retornados pela API externa');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://bora-impactar-prd.setd.rdmapps.com.br/api/login.json',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        }
      );
    });

    it('deve lançar um erro quando ocorre um problema no banco de dados', async () => {
      const apiResponse = {
        user: { id: 1, name: 'John Doe' },
        ngo: { id: 123, name: 'ONG Example' },
      };
      global.fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(apiResponse),
      });

      UserModel.findOne.mockResolvedValueOnce(null);

      const mockError = new Error('Erro no banco de dados');
      UserModel.prototype.save.mockRejectedValueOnce(mockError);

      const userData = { email: 'john@example.com', password: 'password123' };

      await expect(userService.createUser(userData)).rejects.toThrow('Erro no banco de dados');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://bora-impactar-prd.setd.rdmapps.com.br/api/login.json',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        }
      );
      expect(UserModel.findOne).toHaveBeenCalledWith({ 'ngo.id': apiResponse.ngo.id });
    });
  });