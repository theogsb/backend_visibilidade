import { TemplateService } from '../../src/services/templateService.js';
import { TemplateModel } from '../../src/models/models.js';
import fs from 'fs';

jest.mock('../../src/models/models.js');
jest.mock('fs');

jest.spyOn(console, 'log').mockImplementation(() => {});

describe('TemplateService', () => {
  let templateService;

  beforeEach(() => {
    templateService = new TemplateService();
    jest.clearAllMocks();
    TemplateModel.mockClear();
    TemplateModel.find.mockClear();
    TemplateModel.findById.mockClear();
    TemplateModel.prototype.save.mockClear();
    TemplateModel.prototype.deleteOne.mockClear();
    fs.unlinkSync.mockClear();
  });

  describe('getTemplates', () => {
    it('deve retornar uma lista de templates quando existirem no banco de dados', async () => {
      const mockTemplates = [
        { _id: '1', imageUrl: 'url1' },
        { _id: '2', imageUrl: 'url2' }
      ];
      TemplateModel.find.mockResolvedValue(mockTemplates);

      const result = await templateService.getTemplates();

      expect(result).toEqual(mockTemplates);
      expect(TemplateModel.find).toHaveBeenCalledTimes(1);
    });

    it('deve retornar uma lista vazia quando não existirem templates', async () => {
      TemplateModel.find.mockResolvedValue([]);

      const result = await templateService.getTemplates();

      expect(result).toEqual([]);
      expect(TemplateModel.find).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro quando ocorrer problema no banco de dados', async () => {
      const mockError = new Error('Erro de conexão');
      TemplateModel.find.mockRejectedValue(mockError);

      await expect(templateService.getTemplates()).rejects.toThrow('Erro de conexão');
    });
  });

  describe('getTemplate', () => {
    it('deve retornar um template quando ele existe', async () => {
      const mockTemplate = { _id: '123', imageUrl: 'test-url' };
      TemplateModel.findById.mockResolvedValue(mockTemplate);

      const result = await templateService.getTemplate('123');

      expect(result).toEqual(mockTemplate);
      expect(TemplateModel.findById).toHaveBeenCalledWith('123');
    });

    it('deve lançar erro quando o template não é encontrado', async () => {
      TemplateModel.findById.mockResolvedValue(null);

      await expect(templateService.getTemplate('456')).rejects.toThrow('Template não encontrado!');
    });

    it('deve lançar erro quando ocorrer problema no banco de dados', async () => {
      const mockError = new Error('Erro de query');
      TemplateModel.findById.mockRejectedValue(mockError);

      await expect(templateService.getTemplate('789')).rejects.toThrow('Erro de query');
    });
  });

  describe('createTemplate', () => {
    it('deve criar e retornar um novo template com sucesso', async () => {
      const templateData = { imageUrl: 'new-url' };
      const mockTemplate = { 
        _id: '123', 
        ...templateData,
        save: jest.fn().mockResolvedValue({ _id: '123', ...templateData })
      };
      
      TemplateModel.mockImplementation(() => mockTemplate);

      const result = await templateService.createTemplate(templateData);

      expect(result).toEqual(expect.objectContaining({
        _id: '123',
        imageUrl: 'new-url'
      }));
      expect(mockTemplate.save).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro quando ocorrer problema ao salvar', async () => {
      const templateData = { imageUrl: 'new-url' };
      const mockError = new Error('Erro de validação');
      
      const mockTemplate = {
        save: jest.fn().mockRejectedValue(mockError)
      };
      TemplateModel.mockImplementation(() => mockTemplate);

      await expect(templateService.createTemplate(templateData))
        .rejects.toThrow('Erro de validação');
    });
  });

  describe('updateTemplate', () => {
    it('deve atualizar um template existente com sucesso', async () => {
      const existingTemplate = { 
        _id: '123', 
        imagePath: 'old-path', 
        imageUrl: 'old-url',
        save: jest.fn().mockResolvedValue(true)
      };
      
      const updateData = { imagePath: 'new-path', imageUrl: 'new-url' };
      
      TemplateModel.findById.mockResolvedValue(existingTemplate);
      fs.unlinkSync.mockReturnValue(true);

      const result = await templateService.updateTemplate('123', updateData);

      expect(result.imagePath).toBe('new-path');
      expect(result.imageUrl).toBe('new-url');
      expect(fs.unlinkSync).toHaveBeenCalledWith('old-path');
      expect(existingTemplate.save).toHaveBeenCalledTimes(1);
    });

    it('deve lidar com erro ao deletar imagem antiga', async () => {
      const existingTemplate = { 
        _id: '123', 
        imagePath: 'old-path', 
        imageUrl: 'old-url',
        save: jest.fn().mockResolvedValue(true)
      };
      
      const updateData = { imagePath: 'new-path', imageUrl: 'new-url' };
      
      TemplateModel.findById.mockResolvedValue(existingTemplate);
      fs.unlinkSync.mockImplementation(() => {
        throw new Error('Erro ao deletar arquivo');
      });

      const result = await templateService.updateTemplate('123', updateData);

      expect(result.imagePath).toBe('new-path');
      expect(fs.unlinkSync).toHaveBeenCalledWith('old-path');
    });

    it('deve lançar erro quando template não existe', async () => {
      TemplateModel.findById.mockResolvedValue(null);
      
      await expect(templateService.updateTemplate('456', {}))
        .rejects.toThrow('Template não encontrado.');
    });
  });

  describe('deleteTemplate', () => {
    it('deve deletar um template existente com sucesso', async () => {
      const mockTemplate = { 
        _id: '123', 
        imagePath: 'test-path',
        deleteOne: jest.fn().mockResolvedValue(true)
      };
      
      TemplateModel.findById.mockResolvedValue(mockTemplate);
      fs.unlinkSync.mockReturnValue(true);

      await templateService.deleteTemplate('123');

      expect(TemplateModel.findById).toHaveBeenCalledWith('123');
      expect(fs.unlinkSync).toHaveBeenCalledWith('test-path');
      expect(mockTemplate.deleteOne).toHaveBeenCalledTimes(1);
    });

    it('deve lidar com erro ao deletar imagem do template', async () => {
      const mockTemplate = { 
        _id: '123', 
        imagePath: 'test-path',
        deleteOne: jest.fn().mockResolvedValue(true)
      };
      
      TemplateModel.findById.mockResolvedValue(mockTemplate);
      fs.unlinkSync.mockImplementation(() => {
        throw new Error('Erro ao deletar arquivo');
      });

      await templateService.deleteTemplate('123');

      expect(fs.unlinkSync).toHaveBeenCalledWith('test-path');
      expect(mockTemplate.deleteOne).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro quando template não existe', async () => {
      TemplateModel.findById.mockResolvedValue(null);
      
      await expect(templateService.deleteTemplate('456'))
        .rejects.toThrow('Template não encontrado!');
    });
  });
});