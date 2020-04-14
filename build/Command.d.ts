import { ArgInfo } from './Arg';
export interface Option {
    name: string;
    description: string;
    short: string;
    arguments: ArgInfo[];
}
