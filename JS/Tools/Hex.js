export default class Hex{
    /** 将字串符转换为 HEX 
     * @function
     * @param {string} text - 输入目标文本
     * @returns {Uint8Array} 返回 HEX
     */
    static StringToHex(text){
        /*if(text == null){
            return null;
        }
        if(text.length == 0){
            return new Uint8Array(0);
        }

        let hex = [];
        for(let i = 0; i < text.length; i++){
            hex.push(text.charCodeAt(i).toString(16).padStart(2, "0"));
        }
        return new Uint8Array(hex);*/
        //居然有现成的方案
        let te = new TextEncoder("UTF-8");
        return te.encode(text);
    }
    static StrToHex = this.StringToHex;
    static ToHex = this.StringToHex;

    /** 将 HEX 转换为字串符 
     * @function
     * @param {Uint8Array} hex - Hex 对象
     * @returns {string} 返回字串符 
     */
    static HexToString(hex){
        /*if(hex == null){
            return null;
        }
        hex = hex.trim();
        if(hex.length == 0){
            return "";
        }*/
        let tdec = new TextDecoder("UTF-8");
        return tdec.decode(hex);
    }
    static HexToStr = this.HexToString;
    static toString = this.HexToString;

    /** 截取指定位置的 HEX
     * @function
     * @param {Uint8Array} hex - HEX 数据
     * @param {number} start - 截取开始位置
     * @param {number} length - 截取长度
     * @returns {Uint8Array} 返回已截取的 HEX
     */
    static SubHex(hex, start, length){
        if(hex == null || hex.length == 0){
            return null;
        }
        if(start > hex.length || (start + length) > hex.length || start < 0 || length < 0){
            throw new Error("已超出所要截取 HEX 的范围");
        }

        let output = [];
        for(let i = start; i < (start + length); i++){
            output.push( parseInt(hex[i]) );
        }

        return new Uint8Array(output);
    }
    
    /** 转换为 Int, 小端序 
     * @function
     * @param {Uint8Array} hex - HEX 对象
     * @returns {number} 返回 Int
     */
    static ParseIntLo(hex){
        // let length = hex.length;
        // if(hex == null || length == 0){
        //     return 0;
        // }
        // else if(length > 8){
        //     return 2147483647
        // }
        // //长度不够补 0
        // else if(length < 8){
        //     for(let i = 0; i < 8 - length; i++){
        //         hex = hex + "0";
        //     }
        // }

        // let hex2 = ""
        // for (let i = 6; i > -1; i = i - 2) {
        //     hex2 = hex2 + hex[i] + hex[i + 1];
        // }

        // return parseInt(hex2, 16);
        
    }

    /** 转换为 Int, 大端序 
     * @function
     * @param {Uint8Array} hex - HEX 对象
     * @returns {number} 返回 Int
     */
    static ParseIntBo(hex){
        let length = hex.length;
        if(hex == null || length == 0){
            return 0;
        }
        else if(length > 8){
            return 2147483647
        }
        //长度不够补 0
        else if(length < 8){
            for(let i = 0; i < 8 - length; i++){
                hex = hex + "0";
            }
        }
        
        return parseInt(hex, 16);
    }
}