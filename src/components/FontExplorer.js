import { Component, useEffect, useEnv, useRef, useState, useSubEnv } from "@odoo/owl";


export class FontExplorer extends Component{
    static template = "FontExplorer"
    
    setup(){
        this.doc = useState(this.env.doc)
    }
}
export class Font extends Component{
    static template = "Font"
    
    setup(){
        this.state = useState({open: false})
    }

    get font(){
        return this.props.font
    }

    onClick(){
        this.state.open = !this.state.open;
    }
}

export class CharGroup extends Component{   //?glyps, share same width
    static template = "CharGroup"
    setup(){
        this.state = useState({open: false})
        this.graphic = useState({canvas:null})
        useSubEnv(this.graphic)
        this.canvas = null; //? private
        this.canvasRef = useRef('whole')
        this.container = useRef('root')
        useEffect(
            (open, canvas)=>{
                if(open && this.canvas==null)
                    this.buildCanvas();
                
                // if(canvas!=null){
                //     debugger
                //     this.container.el.appendChild(this.canvas)
                // }
            },
            ()=>[this.state.open, this.canvas]
        )
        useEffect(
            (canvas, img)=>{
                if(canvas && img!==null){
                    const ctx = canvas.getContext('2d')
                    ctx.drawImage(img,0,0)
                }
            },
            ()=>[this.canvasRef.el, this.canvas]
        )
    }
    get cmap(){
        return this.props.cmap
    }
    glyphs() {
        const glyphs=[]
        for (let i = 0; i < this.cmap.end - this.cmap.start + 1; i++) {
            glyphs.push(i);
        }
        return glyphs
    }
    onClick(){
        if(this.canvas==null) this.buildCanvas();
        this.state.open = !this.state.open;
    }
    buildCanvas(){
        //lazy, because its resource extensive
        // only build when only just needed
        const canvas = document.createElement('canvas')
        canvas.width = this.cmap.glyph.width;
        canvas.height = this.cmap.height * (this.cmap.end - this.cmap.start + 1);
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = 'black'
        let z = 0;
        // let x = 0;
        let h = 0;
        while(z < this.cmap.glyph.bdt.length){
            for (let x = 0; x < canvas.width; x++) {
                const byte = this.cmap.glyph.bdt.buffer[z++];
                for (let y = 0; y < 8; y++) {
                    const bit = (byte >> y) & 1;
                    if(bit){
                        ctx.fillRect(x,y+h,1,1)
                    }
                    // ctx.fillStyle = bit? 'black' : 'lime'
                    // ctx.fillRect(x,y+h,1,1)
                }
            }
            h += 8

            // z++;
        }
        this.canvas = canvas
        this.graphic.canvas = canvas;
    }
}

export class Glyph extends Component{
    static template = "Glyph"
    setup(){
        this.env = useEnv()
        // this.state = useState({open: false})
        this.canvasRef = useRef('canvas')
        useEffect(
            (canvas, img)=>{
                const {index, height} = this.props
                if(canvas && img!==null){
                    const ctx = canvas.getContext('2d')
                    // ctx.drawImage(img,0,height * index)
                    ctx.drawImage(img,0,-1 * height * index)
                }
            },
            ()=>[this.canvasRef.el, this.props.plane]
        )
    }
}


FontExplorer.components = {Font}
Font.components = {CharGroup}
CharGroup.components = {Glyph}