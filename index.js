import nodemon from 'nodemon';
import browserSync from 'browser-sync';
import minimist from 'minimist';
import { dirname } from 'path';

const args = minimist(process.argv.slice(2));
const port = args.p || 9090;

const bs = browserSync.create();

const __filename = fileURLToPath(import.meta.url); // Obtiene el archivo actual
const __dirname = dirname(__filename); // Obtiene el directorio actual

console.log('Starting nodemon...');

nodemon({
    script: __dirname + '/src/server.mjs',
    ext: 'mjs,js,html,css,pug',
    watch: ['src', 'views', 'public'],
    ignore: ['node_modules/'],
    args: ['-p', port],
})
.on('start', () => {
    if (!bs.active) {
        console.log('Nodemon has started');
        bs.init({
            proxy: `http://localhost:${port}`,
            port: port + 1,
            files: ['src/**/*', 'views/**/*', 'public/**/*'],
            open: false,
            notify: false,
        }, () => {
            console.log('Browser-Sync has started successfully!');
        });
    }
})
.on('restart', () => {
    console.log('Nodemon restarted');
})
.on('quit', () => {
    console.log('Nodemon quit');
    bs.exit();
    process.exit();
});

// Mantén el script corriendo
process.stdin.resume();