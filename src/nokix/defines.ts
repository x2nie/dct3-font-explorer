export const GET_BYTE = ( data: Uint8Array, pos:number ) =>  data[pos] ;
export const GET_HALF = ( data: Uint8Array, pos:number ) =>  (GET_BYTE ( data, ( pos ) ) << 8 ) | GET_BYTE ( data, ( pos + 1 ) ) ;
export const GET_WORD = ( data: Uint8Array, pos:number ) =>  (GET_HALF ( data, ( pos ) ) << 16 ) | GET_HALF ( data, ( pos + 2 ) ) ;

export const ALIGN8 = (x:number) =>          ( ( ( x ) + 7 ) & ~7 );

export type char_t = // data array
{
	// unsigned char *buffer;
	buffer: number[];
	length: number;		// unsigned int
	allocated: number;	// unsigned int
} ;