import { ALIGN8, GET_BYTE, GET_HALF, GET_WORD } from "./defines";
import { FONT_CMAP_SIZE, FONT_GLYPH_SIZE, FONT_HEADER_SIZE, FONT_TRAC_SIZE, type t_font, type t_font_cmap, type t_font_glyph, type t_font_trac } from "./ppmodify";


/*
function ppmodify_font_trac_dump ( data:Uint8Array, pos:number, entries: number ): t_font_trac[]
{
	t_font_trac *trac = NULL;


	if ( !data )
		return NULL;

	while ( entries-- )
	{
		trac = LIST_NEW ( trac, t_font_trac );

		trac.start = GET_HALF ( data, pos + 0 );
		trac.end   = GET_HALF ( data, pos + 2 );
		trac.left  = GET_BYTE ( data, pos + 4 );
		trac.right = GET_BYTE ( data, pos + 5 );

		pos += FONT_TRAC_SIZE;
	}

	LIST_REWND ( trac );
	return trac;
}
*/
function ppmodify_font_cmap_glyph_dump ( data:Uint8Array, pos: number, cmap: t_font_cmap ) //unsigned int
{
	// char *dst;
	let dst:number[];
	let src, dstbit, srcbit, x, offset, bitlen, dst_i;


	if ( !data || !cmap )
		return null;

	pos += cmap.gid * FONT_GLYPH_SIZE;

	cmap.glyph = {bdt: {}} as t_font_glyph;
	cmap.glyph.width  = GET_HALF ( data, pos + 6 );
	cmap.glyph.bitlen = ( cmap.end - cmap.start + 1 ) * cmap.height;

	cmap.glyph.bdt.length    = cmap.glyph.width * ( ALIGN8 ( cmap.glyph.bitlen ) >> 3 );
	cmap.glyph.bdt.allocated = cmap.glyph.bdt.length;
	cmap.glyph.bdt.buffer    = nokix_malloc ( cmap.glyph.bdt.allocated );

	src = pos + GET_WORD ( data, pos ) + cmap.glyph.width * ( cmap.offset >> 3 );
	dst = cmap.glyph.bdt.buffer;
	dst_i = 0;
	dstbit = 0;
	srcbit = cmap.offset;

	while ( dstbit < cmap.glyph.bitlen )
	{
		if ( dstbit && !( dstbit & 7 ) )
			dst_i += cmap.glyph.width;
		if ( ( srcbit - cmap.offset ) && !( srcbit & 7 ) )
			src += cmap.glyph.width;

		x = 0;
		while ( x < cmap.glyph.width )
		{
			bitcpy ( dst, dst_i + x, dstbit & 7, GET_BYTE ( data, src + x ), srcbit & 7 );
			x++;
		}
		dstbit++;
		srcbit++;
	}

	cmap.gid = -1; //RXE_FAIL;
	cmap.offset = 0;

	return 1;//RXE_OK;
}

function nokix_malloc(n:number): number[]{
	const res = []
	for (let i = 0; i < n; i++) {
		res.push(0)
	}
	return res
}

// void bitcpy ( unsigned char *dst, unsigned char dstbit, const unsigned char src, unsigned char srcbit )
function bitcpy ( dst:number[], offset:number, dstbit:number, src:number, srcbit:number )
{
	if ( src & ( 1 << srcbit ) )
		dst[offset] |=  ( 1 << dstbit );
	else
		dst[offset] &= ~( 1 << dstbit );
}

function ppmodify_font_cmap_dump ( data:Uint8Array, pos: number, entries: number, glyph_pos:number ): t_font_cmap[]
{
	const cmaps:t_font_cmap[] = [];
	let v;


	if ( !data )
		return [];

	while ( entries-- )
	{
		const cmap = {} as t_font_cmap;

		cmap.start = GET_HALF ( data, pos + 0 );
		cmap.end   = GET_HALF ( data, pos + 2 );
		v           = GET_WORD ( data, pos + 4 );

		cmap.offset    =   v >> 14;
		cmap.gid       = ( v >> 10 ) & 0x0F;
		cmap.height    = ( v >>  5 ) & 0x1F;
		cmap.base_line =   v         & 0x1F;

		// now look for corresponding glyph and get it
		ppmodify_font_cmap_glyph_dump ( data, glyph_pos, cmap );

		cmaps.push(cmap)

		pos += FONT_CMAP_SIZE;
	}

	return cmaps;
}


function ppmodify_fonts_dump ( data: Uint8Array, offset: number, entries:number ): t_font[]
{
	let pos, glypho, traco, cmapo, trac_len, cmap_len;
	const fonts: t_font[] = []


	if ( !data )
		return [];

	pos = offset;
	while ( entries-- )
	{
		const font = {} as t_font;

		// get header info //* A B C 
		glypho         = GET_WORD ( data, pos + 0x00 );
		traco          = GET_WORD ( data, pos + 0x04 );
		cmapo          = GET_WORD ( data, pos + 0x08 );

		//* D E F G
		trac_len       = GET_HALF ( data, pos + 0x0C ) + 1;
		cmap_len       = GET_HALF ( data, pos + 0x0E ) + 1;
		font.unk0      = GET_HALF ( data, pos + 0x10 );
 
		font.dc        = GET_HALF ( data, pos + 0x12 );
 
		//* H 
		font.flag      = [0,0,0,0]
		font.flag[0]   = GET_BYTE ( data, pos + 0x14 );
		font.flag[1]   = GET_BYTE ( data, pos + 0x15 );
		font.flag[2]   = GET_BYTE ( data, pos + 0x16 );
		font.flag[3]   = GET_BYTE ( data, pos + 0x17 );
 
		font.fb        = GET_BYTE ( data, pos + 0x29 );

		//* I, J
		font.size    = _mem2str(data, pos + 0x18, 11 );
		font.weight  = _mem2str(data, pos + 0x23,  6 );

		// font.trac = ppmodify_font_trac_dump ( data, pos + traco, trac_len );
		font.cmap = ppmodify_font_cmap_dump ( data, pos + cmapo, cmap_len, pos + glypho );

		pos += FONT_HEADER_SIZE;

		fonts.push(font)
	}

	// LIST_REWND ( font );

	return fonts;
}

function _mem2str(data:Uint8Array, offset:number, length:number): string {
	const part = data.slice(offset, offset + length)
	return new TextDecoder('utf-8').decode(part).replace(/\x00/gm,'')
}

export function ppmodify_dump_font_subchunk ( data: Uint8Array, offset: number ): t_font[] //unsigned int
{
	// char name[256];
	// char_t dump;
	// t_font *fonts, *font;
	// unsigned int id;


	if ( !data )
		return [];

	// sprintf ( name, "ppm/%d/%d/count", cid, sid );
	// rexx_envvar_set_integer ( name, 0 );

	const fonts = ppmodify_fonts_dump ( data, offset + 4, GET_WORD ( data, offset ) );
	return fonts

}