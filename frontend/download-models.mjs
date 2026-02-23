import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODEL_URL_BASE = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

const models = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
  'face_expression_model-weights_manifest.json',
  'face_expression_model-shard1'
];

const modelsDir = path.join(__dirname, 'public', 'models');

if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
  console.log('✅ Created: public/models');
}

console.log('📦 Downloading models...\n');

let downloaded = 0;

models.forEach((model, i) => {
  const url = `${MODEL_URL_BASE}/${model}`;
  const filePath = path.join(modelsDir, model);
  
  console.log(`[${i+1}/9] ${model}`);

  https.get(url, (res) => {
    const file = fs.createWriteStream(filePath);
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      downloaded++;
      console.log(`✅ ${model}`);
      
      if (downloaded === 9) {
        console.log('\n🎉 Done! Restart frontend: npm run dev');
      }
    });
  });
});