import { protocol } from 'electron';
import { URL } from 'url';
import * as path from 'path';

export default (scheme: string) => {
  protocol.registerFileProtocol(
    scheme,
    (request, respond) => {
      let pathName = new URL(request.url).pathname;
      pathName = decodeURI(pathName); // Needed in case URL contains spaces

      const filePath = path.join(__dirname, pathName);
      respond({ path: filePath });
    },
  );
};
