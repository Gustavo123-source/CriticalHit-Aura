import { v2 as cloudinary } from 'cloudinary';

(async function() {

    // Configuration
    cloudinary.config({
        cloud_name: 'eqbxgl48',
        api_key: '558956536865244',
        api_secret: 'yfKW5264YPIb1_B6AUZ2OevbS5Q' 
    });
   
    // Upload an image
     const uploadResult = await cloudinary.uploader
       .upload(
           'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
               public_id: 'shoes',
           }
       )
       .catch((error) => {
           console.log(error);
       });
   
    console.log(uploadResult);
   

    const optimizeUrl = cloudinary.url('shoes', {
        fetch_format: 'auto',
        quality: 'auto'
    });
   
    console.log(optimizeUrl);
   

    const autoCropUrl = cloudinary.url('shoes', {
        crop: 'auto',
        gravity: 'auto',
        width: 500,
        height: 500,
    });
   
    console.log(autoCropUrl);    
})();




const CLOUDINARY_CLOUD_NAME = "eqbxgl48";

const CLOUDINARY_UPLOAD_PRESET = "critical_hit";

 

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

 


async function enviarImagemParaCloudinary(arquivo) {

  const formData = new FormData();

  formData.append("file", arquivo);

  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

 

  const resposta = await fetch(CLOUDINARY_UPLOAD_URL, {

    method: "POST",

    body: formData,

  });

 

  if (!resposta.ok) {

    throw new Error("Erro ao enviar imagem para o Cloudinary");

  }

 

  const dados = await resposta.json();

 


  return dados.secure_url;

}

