import { createServer } from 'http';
import { existsSync, createReadStream } from 'fs';
import { join, dirname } from 'path';
import { compileFile } from 'pug';
import { fileURLToPath } from 'url';
import minimist from 'minimist';

const __filename = fileURLToPath(import.meta.url); // Obtiene el archivo actual
const __dirname = dirname(__filename); // Obtiene el directorio actual
const args = minimist(process.argv.slice(2));
const port = args.p || 9090;
const viewsPath = join(__dirname, '../views');

// Función para renderizar plantillas pug
const renderTemplate = (filePath, res) => {
    const template = compileFile(filePath);
    const html = template({ message: 'JAIRA APP DEV', title: 'Hotx Reload Server' });
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
};


const apiController = async (req, res) => {
    //request.on('data', chunk => {
    //    console.log(chunk); // Para procesar los datos enviados en el cuerpo
    //});
    const urlObj = new URL('http://localhost'+req.url)
    const crumbs = urlObj.pathname.split('/').filter(segment => segment !== '');
    crumbs.shift()
    const action = crumbs.shift()||false
    const queryParams = new URLSearchParams(urlObj.search);
    res.writeHead(200, {'Content-Tyoe': 'application/json'});
    try {
        if(action) {
            const fn = (await import(`./api/${action}_controller.js`)).default
            res.end(JSON.stringify(await fn(null,crumbs)))
        } else {
            res.end(JSON.stringify({
                msg: 'THE API CONTROLLER 2',
                id: null,
                result: {
                    method: req.method,
                    url: req.url,
                    action: action,
                    urlObj: urlObj,
                    search: urlObj.search,
                    crumbs: crumbs,
                    queryParams: [queryParams.get('v'), queryParams.get('q')],
                    headers: req.headers,
                }
            }))
        }
    } catch (error) {
        res.end(JSON.stringify({
            action: action,
            error: error,
        }))
    }

}

const server = createServer(async (req, res) => {
    if (req.url.startsWith('/api')) {
        await apiController(req,res)
    } else if (req.url === '/' && req.method === 'GET') {
        renderTemplate(join(viewsPath, 'index.pug'), res);
    } else if (req.url.startsWith('/public')) {
        // Servir archivos estáticos
        const filePath = join(__dirname, '..', req.url);
        if (existsSync(filePath)) {
            if (req.url.endsWith('.js')) {
                res.writeHead(200, { 'Content-Type': 'application/javascript' });
            } else {
                res.writeHead(200);
          }
          createReadStream(filePath).pipe(res);
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('File not found');
        }
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
});

// Arrancar el servidor
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

