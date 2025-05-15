const fontChunkFind: number[] = [0x46, 0x4F, 0x4E, 0x54, 0x66, 0x63, 0x6F, 0x6E, 0x76];

export function locateFontChunk(data: Uint8Array): number {
    let z = 0x0130410;
    let x = 0;

    while(z < data.length){

        z = data.indexOf(fontChunkFind[x], z)

        if(z != -1){
            let match = true
            for (let i = 0; i < fontChunkFind.length; i++) {
                if(data[z+i] != fontChunkFind[i]){
                    match = false
                    break
                }
            }

            if(match) {
                console.log('found at', z.toString(16))
                return z
            }
            else {
                z++;
            }
        }
        else break;
    }

    return -1
}