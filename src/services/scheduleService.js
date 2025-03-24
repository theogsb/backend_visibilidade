import { ScheduleModel } from '../models/models.js';
import fs from 'fs';

export class ScheduleService {
  
  async getSchedule(userId) {
    try {
      const schedule = await ScheduleModel.findOne({ userId });
      if (!schedule) {
        throw new Error('Cronograma não encontrado!');
      }
      
      return schedule;

    } catch(error) {
        throw new Error(error.message);
    }
  }

  async getPost(userId, postId) {
    try {
      const schedule = await ScheduleModel.findOne({ userId });
      if (!schedule) {
        throw new Error('Cronograma não encontrado!');
      }
  
      const post = schedule.posts.id(postId);
      if (!post) {
        throw new Error('Postagem não encontrada!');
      }
  
      return post;

    }catch(error) {
      throw new Error(error.message);
    }
    
  }

  async createPost(userId, postData) {
    try {
      const schedule = await ScheduleModel.findOne({ userId });
      
      if (!schedule) {
        throw new Error('Cronograma não encontrado!');
      }
  
      schedule.posts.push(postData);
      await schedule.save();
  
      return schedule;

    }catch(error) {
      throw new Error(error.message);
    }
  }

  async updatePost(userId, postId, updateData) {
    try {
      const schedule = await ScheduleModel.findOne({ userId });
      if (!schedule) {
        throw new Error('Cronograma não encontrado!');
      }
  
      const postToUpdate = schedule.posts.id(postId);
      if (!postToUpdate) {
        throw new Error('Postagem não encontrada!');
      }
  
      if (updateData.imagePath && postToUpdate.imagePath) {
        try {
          fs.unlinkSync(postToUpdate.imagePath);
        } catch (error) {
          console.log("Arquivo de imagem não encontrado:", postToUpdate.imagePath);
        }
      }
  
      Object.keys(updateData).forEach(key => {
        postToUpdate[key] = updateData[key] || postToUpdate[key];
      });
      await schedule.save();
      
      return schedule;

    }catch(error) {
      throw new Error(error.message);
    }
  }

  async deletePost(userId, postId) {
    try {
      const schedule = await ScheduleModel.findOne({ userId });
      if (!schedule) {
        throw new Error('Cronograma não encontrado!');
      }
  
      const postToDelete = schedule.posts.id(postId);
      if (!postToDelete) {
        throw new Error('Postagem não encontrada!');
      }
  
      if (postToDelete.imagePath) {
        try {
          fs.unlinkSync(postToDelete.imagePath);
        } catch (error) {
          console.log("Arquivo de imagem não encontrado:", postToDelete.imagePath);
        }
      }
  
      schedule.posts.pull(postId);
      await schedule.save();
  
      return schedule;

    }catch( error ) {
      throw new Error(error.message);
    }

  }
}