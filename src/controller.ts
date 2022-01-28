
import Router from 'express';
import { AudioFilter, AudioService } from './service';

const audioController = (audio_service: AudioService) => {
  const router = Router();

  router.post('/post', async (req, res) => {
    const name = req.query.name as string;
    // @ts-ignore
    const data = req.rawbody;
    if (!data) {
      res.status(422).send('Expected file content in body');
      return;
    }
    const audio_record = await audio_service.saveAudio(data, name);
    res.send(audio_record);
  });

  router.get('/download', async (req, res) => {
    // Super basic validation for the name query param
    const filter: AudioFilter = new AudioFilter(req.query);
    if (!filter.name) {
      res.status(422).send('Missing required "name" query parameter');
      return;
    }
    const audio_results = await audio_service.findAudio(filter);
    if (audio_results.num_results === 0) {
      // throw 404
    }
    const audio_file = await audio_service.getFile(audio_results.results[0]);
    res.send(audio_file);
  });

  router.get('/get-chunk', async (req, res) => {
    // Super basic validation for the name query param
    const start_index = parseInt(req.query.start_index as string);
    const num_bytes = parseInt(req.query.num_bytes as string);

    const filter: AudioFilter = new AudioFilter(req.query);
    if (!filter.name) {
      res.status(422).send('Missing required "name" query parameter');
      return;
    }
    const audio_results = await audio_service.findAudio(filter);
    const audio_file = await audio_service.getChunk(
      audio_results.results[0],
      start_index,
      num_bytes
    );
    res.send(audio_file);
  });


  router.get('/list', async (req, res) => {
    const filter: AudioFilter = new AudioFilter(req.query);
    const audio_records = await audio_service.findAudio(filter);
    res.send(audio_records);
  });

  router.get('/info', async (req, res) => {
    // Super basic validation for the name query param
    const filter: AudioFilter = new AudioFilter(req.query);
    if (!filter.name) {
      res.status(422).send('Missing required "name" query parameter');
      return;
    }
    const audio_results = await audio_service.findAudio(filter);
    // Return 404 if no results found, otherwise return first result
    if (audio_results.num_results === 0) {
      res.status(404).send('Not found');
    } else {
      res.send(audio_results.results[0]);
    }
  });

  return router;
};

export default audioController;
