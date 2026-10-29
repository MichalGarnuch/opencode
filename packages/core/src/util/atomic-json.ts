import { open, rename, unlink, realpath, stat, lstat, readlink } from "node:fs/promises"
import { dirname, basename, join, resolve } from "node:path"
import { randomUUID } from "node:crypto"

/** Same-directory replacement: readers see old or complete new JSON, never a prefix.
 * Existing symlinks keep pointing at their target. Concurrent writers are last-writer-wins.
 */
async function target(path: string, depth = 0): Promise<string> {
  if (depth > 40) throw new Error("Too many symbolic links")
  try {
    return await realpath(path)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error
  }
  const entry = await lstat(path).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") return undefined
    throw error
  })
  return entry?.isSymbolicLink() ? target(resolve(dirname(path), await readlink(path)), depth + 1) : path
}

export async function atomicJson(path: string, value: unknown, mode?: number) {
  const resolved = await target(path)
  const previous = await stat(resolved).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") return undefined
    throw error
  })
  const temporary = join(dirname(resolved), `.${basename(resolved)}.${randomUUID()}.tmp`)
  const content = JSON.stringify(value, null, 2)
  if (content === undefined) throw new TypeError("Value is not JSON serializable")
  const permissions = mode ?? (previous ? previous.mode & 0o777 : 0o600)
  const file = await open(temporary, "wx", permissions)
  try {
    await file.writeFile(content, "utf8")
    if (mode !== undefined || previous) await file.chmod(permissions)
    await file.sync()
    await file.close()
    await rename(temporary, resolved)
  } catch (error) {
    await file.close().catch(() => undefined)
    await unlink(temporary).catch(() => undefined)
    throw error
  }
}
