import { resolve } from 'path';

export const entry = './src/App.tsx';
export const output = {
    filename: 'index-bundle.js', // output bundle file name
    path: resolve(__dirname, './static'), // path to our Django static directory
};