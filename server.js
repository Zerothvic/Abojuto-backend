
import app from './app.js';
import { connectDB } from './src/config/db.js'; // Import the new config


const PORT = process.env.PORT || 3500;

const startServer = async () => {
  try {
    await connectDB(); // This now works!
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
};

startServer();