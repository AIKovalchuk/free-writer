import axios from "axios"
import { createWriteStream } from "fs"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import installer from "@ffmpeg-installer/ffmpeg"
import ffmpeg from "fluent-ffmpeg"
import { removeFile } from "./utils.js"

const __dirname = dirname(fileURLToPath(import.meta.url))

class OggConvertor {
  constructor() {
    ffmpeg.setFfmpegPath(installer.path)
  }

  async toMp3(input, output) {
    try {
      const outputPath = resolve(dirname(input), `${output}.mp3`)

      return new Promise((resolve, reject) => {
        ffmpeg(input).inputOption('-t 30')
          .output(outputPath)
          .on('end', () => {
            removeFile(input)
            resolve(outputPath)
          })
          .on('error', (error) => reject(error))
          .run()
      })
    } catch (error) {
      console.log("Error while convert to mp3", error.message)

    }
  }

  async create(url, filename) {
    try {
      const oggPath = resolve(__dirname, '../voices', `${filename}.ogg`)
      const respone = await axios({
        method: "GET",
        url,
        responseType: "stream"
      })

      return new Promise((resolve, reject) => {

        const stream = createWriteStream(oggPath)
        respone.data.pipe(stream)

        stream.on('finish', () => resolve(oggPath))
      })

    } catch (error) {
      console.log("Error while convert", error.message)
    }
  }
}

export const ogg = new OggConvertor()