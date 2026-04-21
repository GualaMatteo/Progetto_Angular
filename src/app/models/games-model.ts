import { CategoriaGiochi } from './categoria-giochi';

export class GamesModel {
    id?:number;
    titolo?:string;
    prezzo?:number;
    datarilascio?:string;
    sviluppatore?:string;
    image_url?:string;
    descrzione?:string;
    categorie?:CategoriaGiochi[];
}
