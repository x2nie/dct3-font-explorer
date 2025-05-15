import { Component } from "@odoo/owl";
import { locateFontChunk } from "./chunkFinder";
import { ppmodify_dump_font_subchunk } from "../nokix/ppmodify_font";

export class DropZone extends Component{
    static template = "DropZone";

    onDragOver(ev){
        ev.preventDefault()
        console.log(ev.offsetX, ev.offsetY)
    }
    onDropFile(ev){
        ev.preventDefault ();
        for (var i = 0, l = ev.dataTransfer.files.length; i < l; i++) {
			// outstanding++;
			
			var file = ev.dataTransfer.files[i],
				reader = new FileReader();
	
			reader.onload = (event) => {
				const arrayBuffer = event.target.result;
                const raw = new Uint8Array(arrayBuffer);

                const startIndex = locateFontChunk(raw)

                // Cari posisi "FONTfconv"
                // const marker = new TextEncoder().encode("FONTfconv"); // byte array untuk "FONTfconv"
                
                // const startIndex = findSequence(raw, marker);
                if (startIndex !== -1) {
                    const sliced = raw.slice(startIndex);
                    console.log("Sliced data from 'FONTfconv':", startIndex);
                    // Lanjutkan pemrosesan sliced...
                    const fonts = ppmodify_dump_font_subchunk(sliced, 0 +28)
                    console.log(fonts)
                } else {
                    console.error("Marker 'FONTfconv' not found in file.");
                }
			};
		
			reader.readAsArrayBuffer (file);
		}
    }
}

function findSequence(buffer, sequence) {
  for (let i = 0; i <= buffer.length - sequence.length; i++) {
    let match = true;
    for (let j = 0; j < sequence.length; j++) {
      if (buffer[i + j] !== sequence[j]) {
        match = false;
        break;
      }
    }
    if (match) return i;
  }
  return -1;
}