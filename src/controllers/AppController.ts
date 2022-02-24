import { createWorker } from "tesseract.js";

export class AppController {

  public static async imageToText(req, res) {
    const { path } = req.body;

    console.log("PA", path);

    const worker = createWorker({
      logger: m => console.log(m)
    });

    (async () => {
      await worker.load();
      await worker.loadLanguage('por');
      await worker.initialize('por');
      const { data: { text } } = await worker.recognize(path);
      console.log(text);
      res.json(text);
      await worker.terminate();
    })();
  }
}