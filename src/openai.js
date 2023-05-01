import { Configuration, OpenAIApi } from "openai"
import config from "config"
import { createReadStream } from "fs"

class OpenAI {
  constructor(apiKey) {
    const configuration = new Configuration({
      apiKey
    })
    this.openai = new OpenAIApi(configuration)
  }

  roles = {
    ASSISTANT: "assistant",
    USER: "user",
    SYSTEM: "system"
  }

  async chat(messages) {
    try {
      const response = await this.openai.createChatCompletion({ model: 'gpt-3.5-turbo', messages })
      return response.data.choices[0].message
    } catch (error) {
      if (error.response) {
        console.log(error.response.status);
        console.log(error.response.data);
      }
      console.log("Error while chat", error.message)
      throw new Error("Error while chat" + error.message)

    }
  }

  async transcription(filepath) {
    try {
      const response = await this.openai.createTranscription(createReadStream(filepath), "whisper-1")
      return response.data.text
    } catch (error) {

      console.log("Error while transcription", error.message)
    }
  }
}

export const openai = new OpenAI(config.get("OPEN_AI_KEY"))