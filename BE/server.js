require('dotenv').config();

const app  = require('./src/app');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅  Multistack API berjalan di port ${PORT}`);
  console.log(`🌐  http://localhost:${PORT}`);
});
