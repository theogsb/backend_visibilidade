import { UserModel, ScheduleModel } from "../models/models.js";

export class UserService {
  
  async getUser(userId) {
    try {
      const user = UserModel.findById(userId);
      
      if(!user) {
        throw new Error('Usuário não encontrado!');
      }
  
      return user;
  
    }catch( error ) {
      throw new Error(error.message);
    }
    
  }
  
  async createUser(userData) {
    try {
      const response = await fetch(
        "https://bora-impactar-prd.setd.rdmapps.com.br/api/login.json",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }
      );
      const data = await response.json();
  
      if (!data || !data.ngo || !data.ngo.id) {
        throw new Error("Dados inválidos retornados pela API externa");
      }
  
      const UserId = data.ngo.id;
      const user = await UserModel.findOne({ "data.ngo.id": UserId });

      if (!user) {
        const newUser = new UserModel({
            user: data.user,
            ngo: data.ngo
        });
        await newUser.save();

        const newSchedule = new ScheduleModel({
          userId: newUser._id,
          posts: [],          
        });

        await newSchedule.save();
  
        return {
          newUser,
          newSchedule
        };
    }  
    }catch( error ) {
      throw new Error(error.message);
    } 
  }

  async updateUser(userId, updateData) {
    try {
      const transformedUpdateData = {};
      
      for (const key in updateData) {
        if (typeof updateData[key] === 'object' && !Array.isArray(updateData[key])) {
        
          for (const nestedKey in updateData[key]) {
          transformedUpdateData[`${key}.${nestedKey}`] = updateData[key][nestedKey];
        }
      } 
      else {
          transformedUpdateData[key] = updateData[key];
      }
    }

    const user = await UserModel.findByIdAndUpdate(
      userId, 
      { $set: transformedUpdateData }, 
      {new: true}
    );
      if (!user) {
            throw new Error('Usuário não encontrado!');
        }

      return user;

    } catch( error ) {
      throw new Error(error.message);
    }
  }
}
