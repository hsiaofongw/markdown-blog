import { readFile, mkdir, writeFile } from 'fs/promises';
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
    for (const i in fullOrigins) {
        map[fullOrigins[i]] = destinations[i];
    }

    console.log(map);

    fullOrigins.forEach(origin => {
        const p = path.parse(map[origin]);
        const dir = p.dir;
        mkdir(dir, { recursive: true })
        .then(x => console.log(`${dir} created.`))
        .then(x => readFile(origin))
        .then(x => writeFile(map[origin], x))
        .then(x => console.log(`Copied: ${origin} to ${map[origin]}`))
        .catch(e => console.log(e));
    });
}

main();

export { main };