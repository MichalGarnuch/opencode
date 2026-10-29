import { test, expect } from "bun:test"
import { mkdtemp, readFile, readdir, rm, symlink, stat, chmod, readlink } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { atomicJson } from "../src/util/atomic-json"
test("failed serialization leaves prior document intact; successful writes are complete", async () => {
  const dir = await mkdtemp(join(tmpdir(), "atomic-json-"))
  try {
    const path = join(dir, "config.json")
    await atomicJson(path, { n: 1 })
    await expect(atomicJson(path, { n: 1n })).rejects.toThrow()
    expect(JSON.parse(await readFile(path, "utf8"))).toEqual({ n: 1 })
    await Promise.all(Array.from({ length: 20 }, (_, n) => atomicJson(path, { n, data: "x".repeat(1000) })))
    expect(JSON.parse(await readFile(path, "utf8")).data.length).toBe(1000)
    expect((await readdir(dir)).length).toBe(1)
    const link = join(dir, "link.json")
    await symlink(path, link)
    await atomicJson(link, { n: 99 })
    expect(JSON.parse(await readFile(path, "utf8"))).toEqual({ n: 99 })
    await chmod(path, 0o640)
    await atomicJson(path, { n: 100 })
    expect((await stat(path)).mode & 0o777).toBe(0o640)
    const dangling = join(dir, "dangling.json")
    const created = join(dir, "created.json")
    await symlink(created, dangling)
    await atomicJson(dangling, { created: true })
    expect(JSON.parse(await readFile(created, "utf8"))).toEqual({ created: true })
    expect(await readlink(dangling)).toBe(created)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})
