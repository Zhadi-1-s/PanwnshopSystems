export const environment = {
  production: false,
  apiUrl: {
    auth:'http://localhost:3000/auth',
    evaluation:'http://localhost:3000/evaluations',
    pawnshops:'http://localhost:3000/pawnshops',
    products:'http://localhost:3000/products',
    users:'http://localhost:3000/users',
    notifications:'http://localhost:3000/notifications',
    offers:'http://localhost:3000/offers',
    slots:'http://localhost:3000/slots'
  },
  cloudinary:{
    apiUrl:'https://api.cloudinary.com/v1_1',
    cloudName:'damnrvrtn',
    uploadPreset:'uploader'
  }
};
