import { protocol } from 'electron';
import { URL } from 'url';
import * as path from 'path';

export default (scheme: string) => {
  protocol.registerFileProtocol(
    scheme,
    (request, respond) => {
      let pathName = new URL(request.url).pathname;
      pathName = decodeURI(pathName); // Needed in case URL contains spaces

      let filePath = path.join(process.resourcesPath, 'app', pathName);
      respond({ path: filePath });
    },
  );
};
