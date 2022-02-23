import { createWorker } from 'tesseract.js';

export class AppController {

  public static async imageToText(req, res) {
    const worker = createWorker({
      logger: m => console.log(m)
    });
    
    (async () => {
      await worker.load();
      await worker.loadLanguage('por');
      await worker.initialize('por');
      const { data: { text } } = await worker.recognize('https://thumbs2.imgbox.com/2f/b9/AQWePxfG_t.jpeg');
      res.json(text)
      await worker.terminate();
    })();
  }
}