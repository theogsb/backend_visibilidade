import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  user: {
    name: {type: String, required: true},
    email: {type: String, required: true}
  },
  ngo: {
    id: {type: String, required: true},
    name: {type: String, required: true},
    description: {type: String, required: false},
    is_formalized: {type: String, required: false},
    start_year: {type: String, required: false},
    contact_phone: {type: String, required: false},

    instagram_link: {type: String, required: false},
    x_link: {type: String, required: false},
    facebook_link: {type: String, required: false},
    pix_qr_code_link: {type: String, required: false},
    site: {type: String, required: false},
    gallery_images_url: [
      {type: String, required: false}
    ],
    
    skills: [
      {
        id: {type: String, required: true},
        name: {type: String, required: true}
      }
    ],

    causes: [
      {
        id: {type: String, required: true},
        name: {type: String, required: true},
        description: {type: String, required: false}
      }
    ],

    sustainable_development_goals: [
      {
        id: {type: String, required: true},
        name: {type: String, required: true},
        url_ods: {type: String, required: false},
        logo_url: {type: String, required: false},
      }
    ]
  }
})


const scheduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  
  posts: [
    {
      platform: {
        type: String,
        required: false,
      },
      postTitle: {
        type: String,
        required: false
      },
      postText: {
        type: String,
        required: false,
      },
      postDate: {
        type: Date,
        required: false,
      },
      postTime: {
        type: String,
        required: false,
      },
      imagePath: {
        type: String,
        required: true,
      },
      imageUrl: {
        type: String,
        required: false,
      }
    },
  ],
});

const templateSchema = new mongoose.Schema({
  imagePath: {  
    type: String,
    required: false,
  },
  imageUrl: {  
    type: String,
    required: false,
  }
});


const UserModel = mongoose.model("User", userSchema);
const ScheduleModel = mongoose.model("Schedule", scheduleSchema);
const TemplateModel = mongoose.model("Template", templateSchema);

export { UserModel, ScheduleModel, TemplateModel };
