//----------------------------------------------------------------------------------------------------------------------
// font chunk

import type { char_t } from "./defines"

export const FONT_HEADER_SIZE      =  0x2C;
export const FONT_GLYPH_SIZE       =  0x0C;
export const FONT_TRAC_SIZE        =  0x08;
export const FONT_CMAP_SIZE        =  0x08;
export const MAX_GLYPH_COUNT       =  0x10;
export const MAX_GLYPH_LENGTH      =  0x40000;

// glyph struct
type t_font_glyph =
{
	width: number;  //unsigned int        // max. 20
	bitlen: number; //unsigned int        // ( ( end - start + 1 ) * height + 7 ) & ~7
	bdt: char_t;    //char_t              // bitmap data; data length = ( bitlen >> 3 ) * width
} ;

// character to glyph mapping
export type t_font_cmap =
{
	// STRUCT_HEADER_LIST ( t_font_cmap );

	start: number;
	end: number;
	height: number;
	base_line: number;
	gid: number;           // glyph id
	offset: number;        // bit offset
	glyph: t_font_glyph;
};

// letter-spacing struct
export type  t_font_trac =
{
	// STRUCT_HEADER_LIST ( t_font_trac );

	start: number; 	// unsigned int
	end: number; 	// unsigned int
	left: number; 	// unsigned int
	right: number; 	// unsigned int
};

// font header
export type t_font = {
	// STRUCT_HEADER_LIST ( t_font );

	dc: number;            // default char
	fb: number;            // fall back font id
	unk0: number;
	flag: [number, number,number, number];
	size: string; //[16];              // dct3, for example "large"
	weight: string; //[8];             // dct3, for example "bold"

	trac:t_font_trac[];
	cmap:t_font_cmap[];
};