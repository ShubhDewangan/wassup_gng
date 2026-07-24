import { UserDocument } from '../models/user.model'
import * as express from 'express';
import 'multer'

declare global {
    namespace Express {
        interface User extends UserDocument {
            _id?: any
        }
    }
}

declare global {
  namespace Express {
    interface Request {
      file?: Multer.File;
      files?: Multer.File[] | { [fieldname: string]: Multer.File[] };
    }
  }
}
