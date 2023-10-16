const cloudinary = require("cloudinary").v2;
          
cloudinary.config({ 
  cloud_name: 'dwnfgmddj', 
  api_key: '399359285313367', 
  api_secret: '5YYr5VaZvtH4MGlQF1jUmneBozI' 
});

module.exports = cloudinary;