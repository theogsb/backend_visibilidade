import { ScheduleService } from '../../src/services/scheduleService.js';
import { ScheduleModel } from '../../src/models/models.js';
import fs from 'fs';
import mongoose from 'mongoose';

jest.mock('../../src/models/models.js');
jest.mock('fs');
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('ScheduleService', () => {
  let scheduleService;

  const createMockPost = (id, data = {}) => ({
    _id: id || new mongoose.Types.ObjectId().toString(),
    ...data,
    remove: jest.fn().mockImplementation(function() {
      const schedule = this._parent;
      schedule.posts.pull(this._id);
      return this;
    })
  });

  const createMockSchedule = (userId, posts = []) => {
    const mockPosts = posts.map(post => ({
      ...createMockPost(post._id, post),
      _parent: {} 
    }));

    const mockSchedule = {
      _id: new mongoose.Types.ObjectId().toString(),
      userId,
      posts: mockPosts,
      save: jest.fn().mockResolvedValue(this),
      markModified: jest.fn()
    };

    mockSchedule.posts.id = function(id) {
      return this.find(post => post._id.toString() === id.toString());
    };

    mockSchedule.posts.pull = jest.fn(function(id) {
      this.posts = this.posts.filter(post => post._id.toString() !== id.toString());
      return this;
    });

    mockPosts.forEach(post => {
      post._parent = mockSchedule;
    });

    return mockSchedule;
  };

  beforeEach(() => {
    scheduleService = new ScheduleService();
    jest.clearAllMocks();
  });

  describe('getSchedule', () => {
    it('deve retornar o cronograma quando existir', async () => {
      const mockSchedule = createMockSchedule('user123');
      ScheduleModel.findOne.mockResolvedValue(mockSchedule);

      const result = await scheduleService.getSchedule('user123');

      expect(result).toEqual(mockSchedule);
      expect(ScheduleModel.findOne).toHaveBeenCalledWith({ userId: 'user123' });
    });

    it('deve lançar erro quando cronograma não existe', async () => {
      ScheduleModel.findOne.mockResolvedValue(null);

      await expect(scheduleService.getSchedule('user456'))
        .rejects.toThrow('Cronograma não encontrado!');
    });

    it('deve lançar erro quando ocorre problema no banco', async () => {
      const mockError = new Error('Erro de conexão');
      ScheduleModel.findOne.mockRejectedValue(mockError);

      await expect(scheduleService.getSchedule('user789'))
        .rejects.toThrow('Erro de conexão');
    });
  });

  describe('getPost', () => {
    it('deve retornar a postagem quando existir', async () => {
      const mockSchedule = createMockSchedule('user123', [
        { _id: 'post123', postTitle: 'Título do Post' }
      ]);
      ScheduleModel.findOne.mockResolvedValue(mockSchedule);

      const result = await scheduleService.getPost('user123', 'post123');

      expect(result._id).toBe('post123');
      expect(result.postTitle).toBe('Título do Post');
      expect(ScheduleModel.findOne).toHaveBeenCalledWith({ userId: 'user123' });
    });

    it('deve lançar erro quando cronograma não existe', async () => {
      ScheduleModel.findOne.mockResolvedValue(null);

      await expect(scheduleService.getPost('user456', 'post123'))
        .rejects.toThrow('Cronograma não encontrado!');
    });

    it('deve lançar erro quando postagem não existe', async () => {
      const mockSchedule = createMockSchedule('user123');
      ScheduleModel.findOne.mockResolvedValue(mockSchedule);

      await expect(scheduleService.getPost('user123', 'post456'))
        .rejects.toThrow('Postagem não encontrada!');
    });
  });

  describe('createPost', () => {
    it('deve criar nova postagem com sucesso', async () => {
      const mockSchedule = createMockSchedule('user123');
      ScheduleModel.findOne.mockResolvedValue(mockSchedule);

      const postData = {
        postTitle: 'Novo Post',
        postText: 'Conteúdo do post',
        imagePath: 'caminho/imagem.jpg'
      };

      const result = await scheduleService.createPost('user123', postData);

      expect(result.posts).toHaveLength(1);
      expect(result.posts[0]).toMatchObject(postData);
      expect(mockSchedule.save).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro quando cronograma não existe', async () => {
      ScheduleModel.findOne.mockResolvedValue(null);

      await expect(scheduleService.createPost('user456', {}))
        .rejects.toThrow('Cronograma não encontrado!');
    });
  });

  describe('updatePost', () => {
    it('deve atualizar postagem existente com sucesso', async () => {
      const mockSchedule = createMockSchedule('user123', [
        { _id: 'post123', postTitle: 'Título Antigo', imagePath: 'caminho/antigo.jpg' }
      ]);
      ScheduleModel.findOne.mockResolvedValue(mockSchedule);

      const updateData = {
        postTitle: 'Título Novo',
        imagePath: 'caminho/novo.jpg'
      };

      const result = await scheduleService.updatePost('user123', 'post123', updateData);

      expect(result.posts[0].postTitle).toBe('Título Novo');
      expect(result.posts[0].imagePath).toBe('caminho/novo.jpg');
      expect(fs.unlinkSync).toHaveBeenCalledWith('caminho/antigo.jpg');
      expect(mockSchedule.save).toHaveBeenCalledTimes(1);
    });

    it('deve lidar com erro ao deletar imagem antiga', async () => {
      const mockSchedule = createMockSchedule('user123', [
        { _id: 'post123', postTitle: 'Título Antigo', imagePath: 'caminho/antigo.jpg' }
      ]);
      ScheduleModel.findOne.mockResolvedValue(mockSchedule);
      fs.unlinkSync.mockImplementation(() => {
        throw new Error('Erro ao deletar arquivo');
      });

      const updateData = {
        postTitle: 'Título Novo',
        imagePath: 'caminho/novo.jpg'
      };

      const result = await scheduleService.updatePost('user123', 'post123', updateData);

      expect(result.posts[0].postTitle).toBe('Título Novo');
      expect(fs.unlinkSync).toHaveBeenCalledWith('caminho/antigo.jpg');
    });

    it('deve lançar erro quando postagem não existe', async () => {
      const mockSchedule = createMockSchedule('user123');
      ScheduleModel.findOne.mockResolvedValue(mockSchedule);

      await expect(scheduleService.updatePost('user123', 'post456', {}))
        .rejects.toThrow('Postagem não encontrada!');
    });
  });

  describe('deletePost', () => {
    it('deve deletar postagem com sucesso', async () => {
      const mockPost = {
        _id: 'post123',
        imagePath: 'caminho/imagem.jpg'
      };
      
      const mockSchedule = {
        posts: [mockPost],
        save: jest.fn().mockResolvedValue(true),
        posts: {
          id: jest.fn().mockReturnValue(mockPost),
          pull: jest.fn()
        }
      };
      
      ScheduleModel.findOne.mockResolvedValue(mockSchedule);
      
      await scheduleService.deletePost('user123', 'post123');
      
      expect(mockSchedule.posts.id).toHaveBeenCalledWith('post123');
      expect(mockSchedule.posts.pull).toHaveBeenCalledWith('post123');
      expect(fs.unlinkSync).toHaveBeenCalledWith('caminho/imagem.jpg');
      expect(mockSchedule.save).toHaveBeenCalled();
    });

    it('deve lidar com erro ao deletar imagem', async () => {
        const mockPost = {
            _id: 'post123',
            imagePath: 'caminho/imagem.png'
        };

        const mockSchedule = {
            posts: [mockPost],
            save: jest.fn().mockResolvedValue(true),
            posts: {
                id: jest.fn().mockReturnValue(mockPost),
                pull: jest.fn()
            }
        };

        ScheduleModel.findOne.mockResolvedValue(mockSchedule);
        fs.unlinkSync.mockImplementation(() => {
            throw new Error('Erro ao deletar arquivo');
        });

        await scheduleService.deletePost('user123', 'post123');

        expect(fs.unlinkSync).toHaveBeenCalledWith('caminho/imagem.png');
        expect(mockSchedule.posts.pull).toHaveBeenCalled();
        expect(mockSchedule.save).toHaveBeenCalled();
    });

    it('deve retornar erro quando postagem não existe', async () => {
        const mockSchedule = {
            posts: [],
            save: jest.fn(),
            posts: {
                id: jest.fn().mockReturnValue(null),
                pull: jest.fn()
            }
        };

        ScheduleModel.findOne.mockResolvedValue(mockSchedule);
        await expect(scheduleService.deletePost('user123', 'post123'))
            .rejects.toThrow('Postagem não encontrada');
        
        expect(mockSchedule.posts.pull).not.toHaveBeenCalled();
        expect(mockSchedule.save).not.toHaveBeenCalled();
    });
  });
});