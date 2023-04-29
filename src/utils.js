import { unlink } from "fs/promises"

export async function removeFile(filePath) {
  try {
    await unlink(filePath)
  } catch (error) {

    console.log("Error while remove file", filePath, error.message)
  }
}