import fs from 'fs'
import { AudioMixer } from 'node-audio-mixer'
import pkg from 'wavefile';
const { WaveFile } = pkg;

async function main() {
  let audioData = [];
  
  const mixer = new AudioMixer({
    sampleRate: 16_000,
    bitDepth: 32,
    channels: 2,
    // delayTime: 125,
  });

  mixer.on('data', (buf) => {
    const data = new Float32Array(buf.buffer);
    const newArray = new Float32Array(audioData.length + data.length);
    newArray.set(audioData);
    newArray.set(data, audioData.length)
    audioData = newArray
  })

  const music = mixer.createAudioInput({
    sampleRate: 16_000,
    bitDepth: 32,
    channels: 1,
  })

  const fish = mixer.createAudioInput({
    sampleRate: 16_000,
    bitDepth: 32,
    channels: 1,
  })

  const musicStream = fs.createReadStream('music.wav')
  const fishStream = fs.createReadStream('fish.wav')
  const outStream = fs.createWriteStream('out.wav')

  musicStream.pipe(music)
  fishStream.pipe(fish)

  mixer.pipe(outStream)

  fishStream.on('end', async() => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('input ended');

    console.info('Saving audio to out.wav')
    const wav = new WaveFile();
    wav.fromScratch(1, 16_000, '32f', audioData);
    fs.writeFileSync(`out.wav`, wav.toBuffer());

    process.exit(0);
  })
}

main().then().catch(console.error)