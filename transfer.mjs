import { readFile, mkdir, writeFile, readdir, rm } from 'fs/promises';
import path from 'path';

async function main() {
    const fileName = process.argv[2];
    const content = await readFile(fileName, 'utf-8');

    const p = path.parse(fileName);
    const postId = p.name;

    const resourceRegex = /\/[\w\d\-\/]+\.[\w]+/g;
    const result = content.match(resourceRegex);

    const origins = result.map(x => x.replace(`/${postId}`, ""));
    const fullOrigins = origins.map(x => `/Users/mike/beyondstars.xyz/static${x}`);
    const destinations = result.map(x => `/Users/mike/test/markdown-blog/public${x}`);

    let map = {};
    const files = await readdir(process.cwd());
    if (files.indexOf('filesToCopy.json') === -1) {
        for (const i in fullOrigins) {
            map[fullOrigins[i]] = destinations[i];
        }

        await writeFile('filesToCopy.json', JSON.stringify(map));
    }
    else {
        map = JSON.parse(await readFile('filesToCopy.json', 'utf-8'));
        for (const origin of Object.keys(map)) {
            const p = path.parse(map[origin]);
            const dir = p.dir;
            await mkdir(dir, { recursive: true })
            .then(x => console.log(`${dir} created.`))
            .then(x => readFile(origin))
            .then(x => writeFile(map[origin], x))
            .then(x => console.log(`Copied: ${origin} to ${map[origin]}`))
            .catch(e => console.log(e));
        }
    }
}

main();

export { main };