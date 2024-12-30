import nodemon from 'nodemon';
import browserSync from 'browser-sync';

const bs = browserSync.create();
const port = 8080;

console.log('Starting nodemon...');

nodemon({
    script: 'src/server.mjs',
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
    //setTimeout(() => {
    //    bs.reload();
    //}, 500); // Ajusta el retraso si es necesario
})
.on('quit', () => {
    console.log('Nodemon quit');
    bs.exit();
    process.exit();
});

// Mantén el script corriendo
process.stdin.resume();