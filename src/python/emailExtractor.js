import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getPythonCommand() {
  // Try python3 first, then fallback to python
  try {
    await new Promise((resolve, reject) => {
      const pythonTest = spawn('python3', ['--version']);
      pythonTest.on('close', (code) => {
        code === 0 ? resolve() : reject();
      });
    });
    return 'python3';
  } catch {
    try {
      await new Promise((resolve, reject) => {
        const pythonTest = spawn('python', ['--version']);
        pythonTest.on('close', (code) => {
          code === 0 ? resolve() : reject();
        });
      });
      return 'python';
    } catch {
      throw new Error('Python is not installed. Please install Python 3.x');
    }
  }
}

export async function extractEmailsFromWebsites(businesses) {
  return new Promise(async (resolve, reject) => {
    try {
      const pythonCommand = await getPythonCommand();
      const pythonScript = path.join(__dirname, '..', '..', 'python', 'email_extractor.py');
      const python = spawn(pythonCommand, [pythonScript]);
      
      let dataString = '';
      let errorString = '';

      python.stdout.on('data', (data) => {
        dataString += data.toString();
      });

      python.stderr.on('data', (data) => {
        errorString += data.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          console.error('Python script error:', errorString);
          resolve(businesses); // Fallback to original data
          return;
        }

        try {
          const enrichedBusinesses = JSON.parse(dataString);
          resolve(enrichedBusinesses);
        } catch (error) {
          console.error('Error parsing Python output:', error);
          resolve(businesses); // Fallback to original data
        }
      });

      // Send businesses data to Python script
      python.stdin.write(JSON.stringify(businesses));
      python.stdin.end();
    } catch (error) {
      console.error('Error running Python script:', error);
      resolve(businesses); // Fallback to original data
    }
  });
} 